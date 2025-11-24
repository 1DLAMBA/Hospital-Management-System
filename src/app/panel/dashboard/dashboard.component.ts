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
import { NotificationsService, Notification } from '../../endpoints/notifications.service';

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
  notifications: Notification[] = [];
  private messageSentHandler?: (data: any) => void;
  private notificationSentHandler?: (data: any) => void;

  constructor(
    private messageService: MessageService,
    private userEndpoint: UserService,
    private spinner: NgxSpinnerService,
    private messagesServe: MessagesService,
    private pusherService: PusherService,
    private router: Router,
    private authService: AuthService,
    private notificationsService: NotificationsService
  ){}
  ngOnInit(): void {
    this.id = localStorage.getItem('id');
    this.getUser();
    this.loadNotifications();
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
        
        // Extract sender name
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

        // Create notification object from message data and add to notifications list
        const messageNotification: Notification = {
          id: data.message.id || Date.now(), // Use message ID or timestamp as fallback
          user_id: Number(this.id),
          type: 'message',
          title: `New Message from ${senderName}`,
          message: data.message.message,
          related_id: data.message.id,
          related_type: 'Message',
          read_at: null,
          created_at: data.message.created_at || new Date().toISOString(),
          updated_at: data.message.created_at || new Date().toISOString()
        };

        // Check if notification already exists (avoid duplicates)
        // Check by related_id for message notifications, or by ID
        const exists = this.notifications.some(n => {
          if (n.type === 'message' && messageNotification.type === 'message') {
            // For messages, check by related_id (message ID)
            return n.related_id === messageNotification.related_id;
          }
          // For other types, check by ID
          return n.id === messageNotification.id;
        });
        
        if (!exists) {
          // Add to notifications list (prepend to show newest first)
          this.notifications.unshift(messageNotification);
        }

        // Also reload from backend to ensure we have the latest (including any backend-created notification)
        this.loadNotifications();
      }
    };

    // Bind to MessageSent event using the shared service
    this.pusherService.bind('MessageSent', this.messageSentHandler);

    // Set up notification handler
    this.notificationSentHandler = (data: any) => {
      console.log('Notification received via websocket:', data.notification);
      
      // Check if notification is for current user
      if (this.id && data.notification && data.notification.user_id == this.id) {
        // Add notification to the list (prepend to show newest first)
        const newNotification: Notification = {
          ...data.notification
        };
        
        // Check if notification already exists (avoid duplicates)
        // For message notifications, also check by related_id to avoid duplicates from MessageSent event
        const exists = this.notifications.some(n => {
          if (n.type === 'message' && newNotification.type === 'message') {
            // For messages, check by related_id (message ID) to catch duplicates from MessageSent
            return n.related_id === newNotification.related_id || n.id === newNotification.id;
          }
          // For other types, check by ID
          return n.id === newNotification.id;
        });
        
        if (!exists) {
          this.notifications.unshift(newNotification);
          
          // Show toast notification
          this.messageService.add({
            severity: 'info',
            summary: 'New Notification',
            detail: newNotification.title,
            life: 3000
          });
        }
      }
    };

    // Bind to NotificationSent event using the shared service
    this.pusherService.bindToNotifications('NotificationSent', this.notificationSentHandler);
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
    // When opening, mark all as read
    this.markAllNotificationsAsRead();
  }

  loadNotifications() {
    if (this.id) {
      this.notificationsService.getNotifications(Number(this.id)).subscribe({
        next: (response) => {
          // Map notifications
          this.notifications = response.notifications;
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
        }
      });
    }
  }

  markAllNotificationsAsRead() {
    if (this.id) {
      this.notificationsService.markAllAsRead(Number(this.id)).subscribe({
        next: () => {
          this.loadNotifications(); // Reload to update read status
        },
        error: (error) => {
          console.error('Error marking notifications as read:', error);
        }
      });
    }
  }

  handleNotificationClick(notification: Notification) {
    // Mark as read locally first (for immediate UI update)
    if (!notification.read_at) {
      // Update local notification state
      const index = this.notifications.findIndex(n => 
        n.id === notification.id || 
        (n.type === 'message' && n.related_id === notification.related_id && notification.type === 'message')
      );
      
      if (index !== -1) {
        this.notifications[index] = {
          ...this.notifications[index],
          read_at: new Date().toISOString()
        };
      }
    }

    // Mark as read on backend (if notification exists in database)
    // Check if it's a real database ID (not a temporary timestamp from Date.now())
    // Database IDs are typically small numbers, timestamps are large (milliseconds since epoch)
    const isDatabaseId = notification.id && notification.id < 1000000000; // Timestamps are > 1 billion
    
    if (this.id && !notification.read_at && isDatabaseId) {
      this.notificationsService.markAsRead(notification.id, Number(this.id)).subscribe({
        next: () => {
          // Reload to sync with backend
          this.loadNotifications();
        },
        error: (error) => {
          // If marking as read fails (e.g., notification doesn't exist in DB yet),
          // that's okay - we already updated the local state
          console.log('Could not mark notification as read on backend:', error);
        }
      });
    } else if (!isDatabaseId && notification.type === 'message') {
      // For message notifications created from MessageSent (with temporary ID),
      // try to find and update the real notification from backend
      // This will be handled when NotificationSent event arrives with the real notification
      // For now, just ensure local state is updated
      this.loadNotifications();
    }

    // Route based on notification type
    switch (notification.type) {
      case 'appointment_booking':
      case 'appointment_accepted':
        // Route to appointments page
        if (this.user?.user_type === 'doctor') {
          this.router.navigate(['panel/doctor-appointment']);
        } else if (this.user?.user_type === 'client') {
          this.router.navigate(['panel/client-appointment']);
        }
        break;
      case 'medical_record_created':
        // Route to medical records page
        if (this.user?.user_type === 'client') {
          // You might want to route to a specific medical record view
          this.router.navigate(['panel/client-panel']);
        } else if (this.user?.user_type === 'doctor') {
          this.router.navigate(['panel/doctor-panel', this.id]);
        }
        break;
      case 'message':
        // Route to messages component (conversations list)
        this.router.navigate(['panel/messages']);
        break;
      default:
        break;
    }
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
           this.notifications.some(n => !n.read_at);
  }
}
