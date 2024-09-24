import { Injectable } from '@angular/core';
import { DynamicDialogRef, DynamicDialogConfig, DialogService } from 'primeng/dynamicdialog';
import { ChatDialogComponent } from './chat-dialog/chat-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ChatDialogService {
  constructor(private dialogService: DialogService) {}

  openChat(senderId: string, receiverId: string): DynamicDialogRef {
    return this.dialogService.open(ChatDialogComponent, {
      header: `Chat with ${receiverId}`,
      width: '400px',
      data: {
        senderId: senderId,
        receiverId: receiverId,
      },
    });
  }
}
