import { Component, OnInit } from '@angular/core';
import { OverlayPanel } from 'primeng/overlaypanel';
import { MessageService } from 'primeng/api';
import { UserResource } from '../../../resources/user.model';
import { UserService } from '../../endpoints/user.service';
import { environment } from '../../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessagesService } from '../../endpoints/messages.service';
import { Router } from '@angular/router';
import { PusherService } from '../../services/pusher.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [MessageService]
})
export class DashboardComponent implements OnInit {
  id: any;
  user!: UserResource
  firstName!: string;
  avatar_file: string = environment.apiUrl + '/file/get/';
  visible: boolean = false;
  newNotificationBatch:boolean = false;
  position: string = 'center';
  notifications: { title: string; message: string; time: Date | string; read?: boolean }[] = [];
  private messageSentHandler?: (data: any) => void;

  constructor(
    private messageService: MessageService,
    private userEndpoint: UserService,
    private spinner: NgxSpinnerService,
    private messagesServe: MessagesService,
    private pusherService: PusherService,
    private router: Router,
    private authService: AuthService
  ){}
  ngOnInit(): void {
    this.id = localStorage.getItem('id');
    this.getUser();
    this.initializePusher();
  }

  private initializePusher(): void {
    // Store the callback reference so we can unbind it later if needed
    this.messageSentHandler = (data: any) => {
      console.log('Message received:', data.message);
      console.log(this.id, data.message.receiver_id);
      if (this.id == data.message.receiver_id) {
        this.messageService.add({severity: 'info', summary: 'new message', detail: data.message.message});
        this.newNotificationBatch = true;
        // Push to notification tray
        const rawSender = data.sender_name;
        let senderName = 'Someone';
        if (typeof rawSender === 'string') {
          // If backend sent a JSON string, parse it to get the name
          const trimmed = rawSender.trim();
          if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
              const parsed = JSON.parse(trimmed);
              senderName = parsed?.name || parsed?.user?.name || rawSender;
            } catch {
              senderName = rawSender;
            }
          } else {
            senderName = rawSender;
          }
        } else if (rawSender && typeof rawSender === 'object') {
          senderName = rawSender.name || rawSender.user?.name || 'Someone';
        }
        this.notifications.unshift({
          title: `New message from ${senderName}`,
          message: data.message.message,
          time: new Date(),
          read: false
        });
      }
    };

    // Bind to MessageSent event using the shared service
    this.pusherService.bind('MessageSent', this.messageSentHandler);
  }

  notificationBadge(){
    this.newNotificationBatch = false;
  }
  toggleNotifications(event: Event, panel: OverlayPanel){
    // Open/close the tray and mark notifications as viewed
    panel.toggle(event);
    if (panel.overlayVisible) {
      // already open
      return;
    }
    // When opening, clear the badge
    this.newNotificationBatch = false;
    // Mark as read
    this.notifications = this.notifications.map(n => ({...n, read: true}));
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
        // avatar_file already initialized
      }
    })
  }
  show(firstname: any) {
    this.messageService.add({ icon: ' bi bi-person', severity: 'success', detail: `Hello, ${firstname}`  });
    console.log(this.user);
  }

  logout() {
    // Call auth service logout (which clears localStorage)
    this.authService.logout();
    // Clear all localStorage (including id)
    localStorage.clear();
    // Navigate to login page
    this.router.navigate(['/login']);
  }

  get hasUnreadNotifications(): boolean {
    return this.notifications && this.notifications.length > 0 && 
           this.notifications.some(n => !n.read);
  }
}
