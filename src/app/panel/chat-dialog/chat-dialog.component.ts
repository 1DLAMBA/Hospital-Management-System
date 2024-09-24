import { Component, Inject } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-chat-dialog',
  templateUrl: './chat-dialog.component.html',
  styleUrls: ['./chat-dialog.component.css'],
})
export class ChatDialogComponent {
  senderId: string;
  receiverId: string;
  visible: boolean = true;

  messages = [
    { from: 'user', text: 'Hi there! How are you?', time: '10:00 AM' },
    { from: 'bot', text: 'Hello! I am good, how can I help you?', time: '10:01 AM' },
  ];
  newMessage: string = '';
  constructor(public ref: DynamicDialogRef, public config: DynamicDialogConfig) {
    // Fetch senderId and receiverId from config
    this.senderId = config.data.senderId;
    this.receiverId = config.data.receiverId;
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      this.messages.push({
        from: 'user',
        text: this.newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      this.newMessage = '';
    }
  }
}
