import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import {
  ChatClientService,
  ChannelService,
  StreamI18nService,
} from 'stream-chat-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesService } from '../../../endpoints/messages.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StreamAutocompleteTextareaModule, StreamChatModule } from 'stream-chat-angular';
import { ConversationService } from '../../../endpoints/conversation.service';
import { environment } from '../../../../environments/environment';
import { MessageService } from 'primeng/api';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../../services/loading.service';
import { PusherService } from '../../../services/pusher.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css'],
  providers: [MessageService]
})
export class MessagesComponent implements OnInit, OnDestroy {
  id?: number = Number(localStorage.getItem('id'));
  message_form: FormGroup;
  conversations?: any;
  filteredConversations?: any;
  searchTerm: string = '';
  visible: boolean = false;
  position: string = 'center';
  avatar_file: string = environment.apiUrl + '/file/get/';
  messages: any[] = [];
  newMessage: string = '';
  receiver_id: any;
  chatDp: any;
  chatName: any;
  newMessageStyle: boolean = false;
  messageReceived: boolean = false;
  private routerSubscription: Subscription;
  private messageSentHandler?: (data: any) => void;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  loading$!: Observable<boolean>;

  constructor(
    private chatService: ChatClientService,
    private channelService: ChannelService,
    private streamI18nService: StreamI18nService,
    private messagesEndpoint: MessagesService,
    private conversationEndpoint: ConversationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private loadingService: LoadingService,
    private pusherService: PusherService
  ) {
    this.loading$ = this.loadingService.loading$;

    const apiKey = 'ahhwc6pvafxh';
    const userId = '1335351';
    const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGlueS10cmVlLTMiLCJleHAiOjE3MjU1NDcwNzd9.hOQnA6GOPAU_x9bMVYtzkSJBJGZlnKbg4pEvBEVrC9Y';

    // Initialize chat service with GetStream
    this.chatService.init(apiKey, userId, userToken);
    this.streamI18nService.setTranslation();
    this.message_form = this.fb.group({
      message: this.fb.control('', [Validators.required])
    });

    

    // Subscribe to router events to detect navigation to this component
    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        // Check if the current route is the messages component route
        if (url.includes('/panel/messages')) {
          console.log('Navigated back to messages component, refreshing conversations');
          this.loadingService.startLoading();
          this.getConversation();
        }
      });

    this.initializePusher();
  
  }
  

  // Removed convogetter method as duplicate call to getConversation
  getConversation() {
    console.log('Fetching conversations for user:', Number(this.id));
    // Use conversation service method with cache-busting timestamp query param
    this.conversationEndpoint.getConversations(this.id + '?_=' + new Date().getTime()).subscribe({
      next: (response: any) => {
        console.log('Conversations received:', response);
        // Sort conversations by updated_at in descending order (most recent first)
        this.conversations = response.data.sort((a: any, b: any) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        this.filteredConversations = [...this.conversations];
        this.loadingService.stopLoading();
      },
      error: (error: any) => {
        console.error('Error fetching conversations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load conversations'
        });
        this.loadingService.stopLoading();
      }
    });
  }

  // Filter conversations based on search term
  filterConversations() {
    if (!this.searchTerm.trim()) {
      this.filteredConversations = [...(this.conversations || [])];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    this.filteredConversations = this.conversations?.filter((conversation: any) => {
      const otherUser = conversation.user_one_id === this.id ? conversation.user_two : conversation.user_one;
      return otherUser.name.toLowerCase().includes(searchLower) || 
             (conversation.last_message && conversation.last_message.toLowerCase().includes(searchLower));
    }) || [];
  }

  // TrackBy function for performance optimization
  trackByConversation(index: number, conversation: any): any {
    return conversation.id || index;
  }

  // Check if user has unread messages (placeholder - implement based on your backend logic)
  hasUnreadMessages(conversation: any): boolean {
    // This is a placeholder - implement based on your backend's unread message tracking
    return false;
  }

  // Check if user is online (placeholder - implement based on your backend logic)
  isUserOnline(conversation: any): boolean {
    // This is a placeholder - implement based on your backend's online status tracking
    return false;
  }

  // Get user type for display
  getUserType(conversation: any): string {
    const otherUser = conversation.user_one_id === this.id ? conversation.user_two : conversation.user_one;
    if(otherUser.user_type == 'other_professional') {
      return otherUser?.other_professionals?.professional_type || 'Healthcare Professional';
    } else {
      return otherUser.user_type || '';
    } 
  }
  
  // TrackBy for message ngFor to avoid re-render flicker
  trackByMessage(index: number, item: any) {
    // Prefer a stable id if backend provides; fallback to timestamp+index
    return item?.id ?? `${item?.created_at?.getTime?.() || item?.created_at || ''}-${index}`;
  }
  ngOnInit(): void {
    // Initialize debug array for production debugging
    if (environment.production) {
      (window as any).pusherDebug = [];
      console.log('Pusher debug enabled. Access logs via: window.pusherDebug');
    }
    
    // Initial data load
    this.loadingService.startLoading();

    this.getConversation();
  }

  ngOnDestroy(): void {
    // Unbind only our specific event handler - service manages the connection
    if (this.messageSentHandler) {
      this.pusherService.unbind('MessageSent', this.messageSentHandler);
    }
    
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  initializePusher(): void {
    // Helper function for production-safe logging
    const log = (message: string, data?: any) => {
      console.log(`[MessagesComponent] ${message}`, data || '');
      // Also log to window for debugging in production
      if (environment.production && (window as any).pusherDebug) {
        (window as any).pusherDebug.push({ time: new Date(), message, data });
      }
    };

    log('Initializing Pusher via service');

    // Store the callback reference so we can unbind it later
    this.messageSentHandler = (data: any) => {
      log('📩 MessageSent event received', data);
      console.log('Full event data:', JSON.stringify(data, null, 2));
      
      // Handle different possible data structures
      let messageData = data;
      if (data.message) {
        messageData = data.message;
      }
      
      log('Processing message', { 
        receiver_id: messageData.receiver_id, 
        sender_id: messageData.sender_id, 
        current_user_id: this.id 
      });
      
      if (this.id == messageData.receiver_id) {
        log('✅ Message is for current user');
        this.messageService.add({
          severity: 'info', 
          summary: 'New message', 
          detail: messageData.message
        });
        
        // Update current chat if it's from the same sender
        if (this.receiver_id && Number(messageData.sender_id) === Number(this.receiver_id)) {
          log('✅ Updating current chat');
          this.messages.push({
            sender_id: messageData.sender_id,
            message: messageData.message,
            created_at: new Date(),
          });
          this.scrollToBottom();
        }
        // Always refresh the conversation list to show the latest message
        this.getConversation();
      } else {
        log('⚠️ Message not for current user', { 
          expected: this.id, 
          received: messageData.receiver_id 
        });
      }
    };

    // Bind to MessageSent event using the shared service
    this.pusherService.bind('MessageSent', this.messageSentHandler);

    log('Pusher initialization complete');
  }
  

  ngAfterViewChecked() {
    // Scroll to bottom after Angular finishes checking the view
    this.scrollToBottom();
  }
  
  scrollToBottom(): void {
    try {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = 
          this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  

  sendMessage() {
    if (this.newMessage.trim()) {
      const timestamp = new Date();
      
      // Add message to local display immediately
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
        next: (response: any) => {
          console.log('Message sent successfully:', response);
          // Refresh conversation list after sending a message
          this.getConversation();
        },
        error: (error: any) => {
          console.error('Error sending message:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to send message'
          });
        }
      });

      this.newMessage = '';
      this.scrollToBottom();
    }
  }
  
  showDialog(conversation: any) {
    this.loadingService.startLoading();
    if (conversation.user_one.id == this.id) {
      const formData = {
        user_id: this.id,
        receiver_id: conversation.user_two.id
      };
      this.receiver_id = conversation.user_two.id;
      this.chatDp = conversation.user_two.passport;
      this.chatName = conversation.user_two.name;
      this.loadMessageHistory(formData);
      this.loadingService.stopLoading();
    } else if (conversation.user_two.id == this.id) {
      const formData = {
        user_id: this.id,
        receiver_id: conversation.user_one.id
      };
      this.receiver_id = conversation.user_one.id;
      this.chatDp = conversation.user_one.passport;
      this.chatName = conversation.user_one.name;
      this.loadMessageHistory(formData);
      this.loadingService.stopLoading();
    }
  }

  loadMessageHistory(formData: any) {
    this.messagesEndpoint.getMessageHistory(formData).subscribe({
      next: (response: any) => {
        console.log('Message history loaded:', response);
        this.messages = (response.data || []).map((m: any, idx: number) => ({
          ...m,
          // Normalize timestamp to Date for the date pipe
          created_at: m?.created_at ? new Date(m.created_at) : new Date(),
          // Ensure sender_id is numeric to match current id type
          sender_id: typeof m?.sender_id === 'string' ? Number(m.sender_id) : m?.sender_id
        }));
        this.visible = true;
        setTimeout(() => this.scrollToBottom(), 100); // Ensure scroll happens after DOM update
      },
      error: (error: any) => {
        console.error('Error loading message history:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load message history'
        });
      }
    });
  }
  
  close() {
    this.visible = false;
  }

  // Navigate to standalone chat page
  openChat(conversation: any) {
    let receiver: any | undefined;

    if (conversation?.user_one_id == this.id) {
      receiver = conversation?.user_two;
    } else if (conversation?.user_two_id == this.id) {
      receiver = conversation?.user_one;
    }

    const receiverId = Number(receiver?.id);
    if (!receiverId) {
      console.warn('Unable to determine receiver for conversation', conversation);
      return;
    }

    this.router.navigate([`/panel/messages/${receiverId}`], {
      queryParams: {
        name: receiver?.name,
        dp: receiver?.passport,
        email: receiver?.email,
        phoneno: receiver?.phoneno,
        gender: receiver?.gender,
        user_type: receiver?.user_type
      }
    });
  }
}