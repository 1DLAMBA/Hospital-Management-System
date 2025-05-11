import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { UserResource } from '../../../resources/user.model';
import { UserService } from '../../endpoints/user.service';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessagesService } from '../../endpoints/messages.service';
import Pusher from 'pusher-js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  id: any;
  user!: UserResource
  firstName!: string;
  avatar_file!:string;
  visible: boolean = false;
  newNotificationBatch:boolean = false;
  position: string = 'center';
  pusher: any;
  router?: Router;
  channel: any;

  constructor(
    private messageService: MessageService,
    private userEndpoint: UserService,
    private spinner: NgxSpinnerService,
    private messagesServe: MessagesService,
    //  router: Router
  ){
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
        // console.log('new message',data.message)
        this.newNotificationBatch = true;
        // this.getConversation();
      
      }
      // Handle incoming message
      // this.getConversation();
    });
  }
  ngOnInit(): void {
    this.id=localStorage.getItem('id')
    this.getUser();
  }

  notificationBadge(){
    this.newNotificationBatch = false;
  }
  showDialog() {
      // this.position = position;
      this.visible = true;
  }


  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        console.log(response.user.name.split(" "))
        const splitNames= this.user.name.split(" ");
        this.firstName = splitNames[0];
        this.show(this.firstName);
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }
  show(firstname: any) {
    this.messageService.add({ icon: ' bi bi-person', severity: 'success', detail: `Hello, ${firstname}`  });
    console.log(this.user);
  }
}
