import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'; import {
  ChatClientService,
  ChannelService,
  StreamI18nService,

} from 'stream-chat-angular';
import { TranslateModule } from '@ngx-translate/core';
import { MessagesService } from '../../../endpoints/messages.service';
import { error } from 'console';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StreamAutocompleteTextareaModule, StreamChatModule } from 'stream-chat-angular';
import { ConversationService } from '../../../endpoints/conversation.service';
import { response } from 'express';
import { environment } from '../../../../environments/environment';
import Pusher from 'pusher-js';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
  providers: [MessageService]


})
export class MessagesComponent implements OnInit {
  id?: any = localStorage.getItem('id');
  message_form: FormGroup;
  conversations?: any;
  visible: boolean = false;
  position: string = 'center';
  avatar_file!:string;
  messages:any[] =[] ;
  newMessage: string = '';
  receiver_id: any;
  chatDp: any;
  chatName: any;
  pusher: any;
  channel: any;
  messageReceived: boolean = false ;
  @ViewChild('messageContainer') messageContainer!: ElementRef;


  constructor(
    private chatService: ChatClientService,
    private channelService: ChannelService,
    private streamI18nService: StreamI18nService,
    private messagesEndpoint: MessagesService,
    private conversationEndpoint: ConversationService,
    // private pusher: Pusher,
    private messageService: MessageService,

    private fb: FormBuilder,


  ) {
    const apiKey = 'ahhwc6pvafxh';
    const userId = '1335351';
    const userToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidGlueS10cmVlLTMiLCJleHAiOjE3MjU1NDcwNzd9.hOQnA6GOPAU_x9bMVYtzkSJBJGZlnKbg4pEvBEVrC9Y';

    // Initialize chat service with GetStream
    this.chatService.init(apiKey, userId, userToken);
    this.streamI18nService.setTranslation();
    this.message_form = this.fb.group({
      message: this.fb.control('', [Validators.required])
    })

    this.pusher = new Pusher('45cde359e2dec89841a7', {
      cluster: 'mt1',
      // forceTLS: true,
    });

    this.channel = this.pusher.subscribe('messaging-channel');
    
    this.channel.bind('MessageSent', (data: any) => {
      console.log('Message received:', data.message);
      console.log(this.id, data.message.receiver_id )
      if(this.id == data.message.receiver_id){
        this.messageService.add({severity: 'info', summary: 'new message', detail: data.message.message})
      }
      // Handle incoming message
      this.getConversation();
    });
  }

 ngOnInit() {

    this.avatar_file = environment.apiUrl + '/file/get/';        
    this.getConversation();

  }

  ngAfterViewChecked() {
    // Always scroll to the bottom after Angular finishes checking the view
    this.scrollToBottom();
  }
  scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = 
        this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  getConversation(){
    this.conversationEndpoint.getConversations(this.id).subscribe({
      next: (response: any) => {
        console.log('CONVO',response)
        this.conversations = response.data
      }, error: (error: any) => {
        console.error(error);

      }
    })
  }


 sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        sender_id: this.id,
        message: this.newMessage,
        created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      const formData = {
        sender_id: this.id,
        receiver_id: this.receiver_id,
        message: this.newMessage
      }
      this.messagesEndpoint.sendMessage(formData).subscribe({
        next: (response: any) => {
          console.log(response);
        },error:(error: any)=>{
          console.log(error)
        }
      })

      this.newMessage = '';
    }
  }
  showDialog(conversation: any) {
    // this.position = position;
    
    if (conversation.user_one.id == this.id) {

      const formData = {
        user_id: this.id,
        receiver_id: conversation.user_two.id
      }
      this.receiver_id = conversation.user_two.id;
      this.chatDp = conversation.user_two.passport;
      this.chatName = conversation.user_two.name;
      this.messagesEndpoint.getMessageHistory(formData).subscribe({
        next: (response: any) => {
          console.log(response)
          this.messages = response.data;
          this.visible = true;
        }
        
      })
    } else if (conversation.user_two.id  == this.id) {
      const formData = {
        user_id: this.id,
        receiver_id: conversation.user_one.id

      }
      this.receiver_id = conversation.user_one.id
      this.chatDp= conversation.user_one.passport;
      this.chatName = conversation.user_one.name;
      this.messagesEndpoint.getMessageHistory(formData).subscribe({
        next: (response: any) => {
          console.log(response)
          this.messages = response.data;
          this.visible = true;
        }

      })
    }

  }
  close(){
    this.visible = false
  }

  
}
