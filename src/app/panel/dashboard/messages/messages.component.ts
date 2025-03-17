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
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  providers: [MessageService]
})
export class MessagesComponent implements OnInit, OnDestroy {
  id?: any = localStorage.getItem('id');
  message_form: FormGroup;
  conversations?: any;
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

  constructor(
    private chatService: ChatClientService,
    private channelService: ChannelService,
    private streamI18nService: StreamI18nService,
    private messagesEndpoint: MessagesService,
    private conversationEndpoint: ConversationService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private router: Router
  ) {
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
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      // Check if the current route is the messages component route
      if (this.router.url.includes('/messages')) {
        console.log('Navigated back to messages component, refreshing conversations');
        this.getConversation();
        this.convogetter();
      }
    });

    this.initializePusher();
    this.getConversation();
    
  }

  convogetter(){
    this.getConversation()
  }
  getConversation() {
    console.log('Fetching conversations for user:', this.id);
    this.conversationEndpoint.getConversations(this.id).subscribe({
      next: (response: any) => {
        console.log('Conversations received:', response);
        // Sort conversations by updated_at in descending order (most recent first)
        this.conversations = response.data.sort((a: any, b: any) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      },
      error: (error: any) => {
        console.error('Error fetching conversations:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load conversations'
        });
      }
    });
  }
  ngOnInit(): void {
    // Initial data load
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
    this.pusher = new Pusher('45cde359e2dec89841a7', {
      cluster: 'mt1',
    });

    this.channel = this.pusher.subscribe('messaging-channel');
    
    this.channel.bind('MessageSent', (data: any) => {
      console.log('Message received:', data.message);
      
      if (this.id == data.message.receiver_id) {
        this.messageService.add({
          severity: 'info', 
          summary: 'New message', 
          detail: data.message.message
        });
        
        // Update current chat if it's from the same sender
        if (this.visible && this.receiver_id == data.message.sender_id) {
          this.messages.push({
            sender_id: data.message.sender_id,
            message: data.message.message,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
          this.scrollToBottom();
        }
      }
      
      // Always refresh the conversation list to show the latest message
      this.getConversation();
    });
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
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Add message to local display immediately
      this.messages.push({
        sender_id: this.id,
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
    if (conversation.user_one.id == this.id) {
      const formData = {
        user_id: this.id,
        receiver_id: conversation.user_two.id
      };
      this.receiver_id = conversation.user_two.id;
      this.chatDp = conversation.user_two.passport;
      this.chatName = conversation.user_two.name;
      this.loadMessageHistory(formData);
    } else if (conversation.user_two.id == this.id) {
      const formData = {
        user_id: this.id,
        receiver_id: conversation.user_one.id
      };
      this.receiver_id = conversation.user_one.id;
      this.chatDp = conversation.user_one.passport;
      this.chatName = conversation.user_one.name;
      this.loadMessageHistory(formData);
    }
  }

  loadMessageHistory(formData: any) {
    this.messagesEndpoint.getMessageHistory(formData).subscribe({
      next: (response: any) => {
        console.log('Message history loaded:', response);
        this.messages = response.data;
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
}