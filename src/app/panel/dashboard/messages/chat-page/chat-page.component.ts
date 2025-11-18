import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../../../../endpoints/messages.service';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';
import { LoadingService } from '../../../../services/loading.service';
import { Observable, Subscription } from 'rxjs';
import { PusherService } from '../../../../services/pusher.service';

@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
  providers: [MessageService]
})
export class ChatPageComponent implements OnInit, OnDestroy {
  id?: number = Number(localStorage.getItem('id'));
  avatar_file: string = environment.apiUrl + '/file/get/';
  loading$!: Observable<boolean>;

  messages: any[] = [];
  newMessage: string = '';
  receiver_id!: number;
  chatDp?: string;
  chatName?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  receiverGender?: string;
  receiverType?: string;

  // UI State
  sidebarHidden: boolean = false;
  isOnline: boolean = false;
  isTyping: boolean = false;
  isMobile: boolean = false;
  
  // Scroll management
  private isUserScrolling: boolean = false;
  private isAtBottom: boolean = true;
  private scrollTimeout: any;
  private messageSentHandler?: (data: any) => void;

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messagesEndpoint: MessagesService,
    private messageService: MessageService,
    private loadingService: LoadingService,
    private pusherService: PusherService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
    // Check if mobile
    this.checkMobile();
    window.addEventListener('resize', () => this.checkMobile());
    
    // Read params
    this.routeSub = this.route.paramMap.subscribe(params => {
      const rid = Number(params.get('receiverId'));
      if (!rid) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid chat link' });
        this.goBack();
        return;
      }
      this.receiver_id = rid;
      // Optional query params for name/dp
      const qp = this.route.snapshot.queryParamMap;
      this.chatName = qp.get('name') || this.chatName;
      this.chatDp = qp.get('dp') || this.chatDp;
      this.receiverEmail = qp.get('email') || this.receiverEmail;
      this.receiverPhone = qp.get('phoneno') || this.receiverPhone;
      this.receiverGender = qp.get('gender') || this.receiverGender;
      this.receiverType = qp.get('user_type') || this.receiverType;

      this.initializePusher();
      this.loadMessageHistory();
    });
  }

  ngOnDestroy(): void {
    // Unbind only our specific event handler - service manages the connection
    if (this.messageSentHandler) {
      this.pusherService.unbind('MessageSent', this.messageSentHandler);
    }
    this.routeSub?.unsubscribe();
    window.removeEventListener('resize', () => this.checkMobile());
    
    // Clear scroll timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }

  trackByMessage(index: number, item: any) {
    return item?.id ?? `${item?.created_at?.getTime?.() || item?.created_at || ''}-${index}`;
  }

  initializePusher(): void {
    // Store the callback reference so we can unbind it later
    this.messageSentHandler = (data: any) => {
      console.log('Message received via websocket:', data.message);
      if (this.id == data.message.receiver_id && Number(data.message.sender_id) === this.receiver_id) {
        this.messages.push({
          sender_id: data.message.sender_id,
          message: data.message.message,
          created_at: new Date(),
        });
        this.scrollToBottom();
      }
    };

    // Bind to MessageSent event using the shared service
    this.pusherService.bind('MessageSent', this.messageSentHandler);
  }

  loadMessageHistory(): void {
    this.loadingService.startLoading();
    const formData = {
      user_id: this.id,
      receiver_id: this.receiver_id
    };
    this.messagesEndpoint.getMessageHistory(formData).subscribe({
      next: (response: any) => {
        this.messages = (response.data || []).map((m: any) => ({
          ...m,
          created_at: m?.created_at ? new Date(m.created_at) : new Date(),
          sender_id: typeof m?.sender_id === 'string' ? Number(m.sender_id) : m?.sender_id
        }));
        this.loadingService.stopLoading();
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err: any) => {
        console.error('Error loading message history:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load message history' });
        this.loadingService.stopLoading();
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) return;

    const timestamp = new Date();
    this.messages.push({
      sender_id: Number(this.id),
      message: this.newMessage,
      created_at: timestamp,
    });

    const formData = {
      sender_id: this.id,
      receiver_id: this.receiver_id,
      message: this.newMessage
    };

    this.messagesEndpoint.sendMessage(formData).subscribe({
      next: () => {},
      error: (error: any) => {
        console.error('Error sending message:', error);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to send message' });
      }
    });

    this.newMessage = '';
    this.scrollToBottom();
  }

  onEnter(event: any): void {
    // Allow Shift + Enter to insert a newline
    if (event && event.shiftKey) {
      return;
    }
    // Prevent default newline and send instead
    event.preventDefault();
    this.sendMessage();
  }

  ngAfterViewChecked() {
    // Only auto-scroll if user is at bottom and not manually scrolling
    if (this.isAtBottom && !this.isUserScrolling) {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
        this.isAtBottom = true;
      }
    } catch {}
  }

  onScroll(): void {
    if (!this.messageContainer || !this.messageContainer.nativeElement) return;
    
    const element = this.messageContainer.nativeElement;
    const threshold = 50; // pixels from bottom
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight <= threshold;
    
    this.isAtBottom = isNearBottom;
    
    // Set user scrolling flag
    this.isUserScrolling = true;
    
    // Clear existing timeout
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    
    // Reset user scrolling flag after a delay
    this.scrollTimeout = setTimeout(() => {
      this.isUserScrolling = false;
    }, 150);
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  toggleSidebar(): void {
    this.sidebarHidden = !this.sidebarHidden;
  }

  // Placeholder methods for future implementation
  checkOnlineStatus(): void {
    // Implement online status checking logic
    this.isOnline = Math.random() > 0.5; // Placeholder
  }

  simulateTyping(): void {
    // Implement typing indicator logic
    this.isTyping = false; // Placeholder
  }

  checkMobile(): void {
    this.isMobile = window.innerWidth <= 992;
    if (this.isMobile) {
      this.sidebarHidden = true;
    }
  }
}
