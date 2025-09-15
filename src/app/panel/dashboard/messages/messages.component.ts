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
import Pusher from 'pusher-js';
import { MessageService } from 'primeng/api';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LoadingService } from '../../../services/loading.service';

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
  pusher: any;
  channel: any;
  newMessageStyle: boolean = false;
  messageReceived: boolean = false;
  private routerSubscription: Subscription;
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
    private loadingService: LoadingService
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
    return otherUser.user_type || '';
  }
  
  // TrackBy for message ngFor to avoid re-render flicker
  trackByMessage(index: number, item: any) {
    // Prefer a stable id if backend provides; fallback to timestamp+index
    return item?.id ?? `${item?.created_at?.getTime?.() || item?.created_at || ''}-${index}`;
  }
  ngOnInit(): void {
    // Initial data load
    this.loadingService.startLoading();

    this.getConversation();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions when component is destroyed
    if (this.channel) {
      this.channel.unbind_all();
      this.pusher.unsubscribe('messaging-channel');
    }
    
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  initializePusher(): void {
    // Enable verbose logging in non-production for troubleshooting
    if (!environment.production) {
      Pusher.logToConsole = true;
    }

    // Basic Pusher configuration (cloud). If you move to self-hosted websockets,
    // adjust options (wsHost/wsPort/forceTLS) here.
    this.pusher = new Pusher('45cde359e2dec89841a7', {
      cluster: 'mt1',
      forceTLS: true,
      // reconnect options
      enabledTransports: ['ws', 'wss'],
    });

    // Connection state logging
    this.pusher.connection.bind('state_change', (states: any) => {
      console.log('Pusher state change:', states.previous, '->', states.current);
    });
    this.pusher.connection.bind('connected', () => {
      console.log('Pusher connected');
    });
    this.pusher.connection.bind('error', (err: any) => {
      console.error('Pusher connection error:', err);
      this.messageService.add({
        severity: 'warn',
        summary: 'Realtime offline',
        detail: 'Live updates unavailable; will still poll conversations.'
      });
    });

    this.channel = this.pusher.subscribe('messaging-channel');

    // Channel subscription diagnostics
    this.channel.bind('pusher:subscription_succeeded', () => {
      console.log('Subscribed to messaging-channel');
    });
    this.channel.bind('pusher:subscription_error', (status: any) => {
      console.error('Subscription error:', status);
    });
    
    // App event from Laravel
    this.channel.bind('MessageSent', (data: any) => {
      console.log('Message received:', data.message);
      
      if (this.id == data.message.receiver_id) {
        this.messageService.add({
          severity: 'info', 
          summary: 'New message', 
          detail: data.message.message
        });
        
        // Update current chat if it's from the same sender
        this.messages.push({
          sender_id: data.message.sender_id,
          message: data.message.message,
          created_at: new Date(),
        });
        this.scrollToBottom();
        this.getConversation();
      }
    });
    
    // Always refresh the conversation list to show the latest message
  };
  

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