import { Component, OnInit } from '@angular/core'; import {
  ChatClientService,
  ChannelService,
  StreamI18nService,

} from 'stream-chat-angular';
import { TranslateModule } from '@ngx-translate/core';
import Pusher from 'pusher-js';
import { MessagesService } from '../../../endpoints/messages.service';
import { error } from 'console';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StreamAutocompleteTextareaModule, StreamChatModule } from 'stream-chat-angular';
import { ConversationService } from '../../../endpoints/conversation.service';
import { response } from 'express';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',

})
export class MessagesComponent implements OnInit {
  id?: any;
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



  constructor(
    private chatService: ChatClientService,
    private channelService: ChannelService,
    private streamI18nService: StreamI18nService,
    private messagesEndpoint: MessagesService,
    private conversationEndpoint: ConversationService,
    // private pusher: Pusher,
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
  }

  async ngOnInit() {
    // Initialize channel with GetStream (existing logic)
    this.id = localStorage.getItem('id')
    this.avatar_file = environment.apiUrl + '/file/get/';        


    const channel = this.chatService.chatClient.channel('messaging', 'talking-about-angular', {
      image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Angular_full_color_logo.svg/2048px-Angular_full_color_logo.svg.png',
      name: 'Talking about Angular',
    });


    // Set up Pusher for Laravel WebSockets (new logic)
    // this.setupPusher();

    this.conversationEndpoint.getConversations(this.id).subscribe({
      next: (response: any) => {
        console.log(response)
        this.conversations = response.data
      }, error: (error: any) => {
        console.error(error);

      }
    })
  }

  // getMessage(receiver_id :any){

  // }

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

  // Function to set up Pusher for Laravel WebSockets
  setupPusher() {
    // this.pusher = new Pusher('45cde359e2dec89841a7', {
    //   cluster: 'mt1',
    //   authEndpoint: '/broadcasting/auth', // Laravel auth route for private channels
    // });

    // Subscribe to private chat channel
    // // const channel = this.pusher.subscribe('private-chat.' + this.id);

    // // Listen for incoming messages
    // channel.bind('MessageSent', (data: any) => {
    //   console.log('New message received:', data);
    //   // Handle the message received from Laravel WebSockets
    // });
  }

  // Function to send a message
  // sendMessage(receiverId: any) {
  //   // Send message to Laravel backend via API
  //   const formData = {
  //     receiver_id: receiverId,
  //     sender_id: this.id,
  //     message:this.message_form.value.message

  //   }
  //   this.messagesEndpoint.sendMessage(formData).subscribe({
  //     // next()=>{},error()=>
  //     next: (response: any )=>{
  //       console.log(response)
  //     }, error:(error: any)=>{ console.error(error)}
  //   })
  //   // fetch('/api/messages/send', {
  //   //   method: 'POST',
  //   //   body: JSON.stringify({
  //   //     content: content,
  //   //     to_user_id: 'recipient_user_id', // Replace with actual recipient ID
  //   //   }),
  //   //   headers: {
  //   //     'Content-Type': 'application/json',
  //   //   },
  //   // });
  // }

}
