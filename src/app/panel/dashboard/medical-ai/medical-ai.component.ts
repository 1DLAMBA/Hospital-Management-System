import { Component, OnInit, ViewChild, ElementRef, OnDestroy, AfterViewInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MedicalAIService } from '../../../../app/endpoints/medical-ai.service';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY = 'medical_ai_conversation';



@Component({
  selector: 'app-medical-ai',
  templateUrl: './medical-ai.component.html',
  styleUrls: ['./medical-ai.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    ToastModule
  ]
})
export class MedicalAIComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  messages: any[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  conversationId?: number;
  userId!: any;

  constructor(
    private medicalAIService: MedicalAIService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('id');
    this.medicalAIService.getConversations(this.userId).subscribe({
      next: (res: any) => {
        const convos = res?.data || [];
        if (convos.length === 0) {
          this.medicalAIService.createConversation(this.userId).subscribe({
            next: (r: any) => { this.conversationId = r?.data?.id; this.loadMessages(); }
          });
        } else {
          this.conversationId = convos[0].id;
          this.loadMessages();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Scroll to bottom after view is initialized
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }
  ngOnDestroy(): void {}

  private getCurrentUserId(): number {
    try {
      const u = localStorage.getItem('user');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed && parsed.id) return Number(parsed.id);
      }
      const direct = localStorage.getItem('id');
      if (direct) return Number(direct);
      return 0;
    } catch { return 0; }
  }

  private loadMessages(): void {
    if (!this.conversationId) return;
    this.medicalAIService.getMessages(this.conversationId).subscribe({
      next: (r: any) => {
        const data = r?.data || [];
        this.messages = data.map((m: any) => ({
          type: m.role === 'assistant' ? 'ai' : 'user',
          content: m.content,
          timestamp: new Date(m.created_at)
        }));
        if (this.messages.length === 0) {
          // Fallback: try showing any locally cached conversation from before backend persistence
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              this.messages = (parsed || []).map((msg: any) => ({
                type: msg.type,
                content: msg.content,
                timestamp: new Date(msg.timestamp)
              }));
            }
          } catch {}
          if (this.messages.length === 0) {
            this.messages.push({
              type: 'ai',
              content: 'Hello! I am your medical AI assistant. How can I help you today?',
              timestamp: new Date()
            });
          }
        }
        setTimeout(() => this.scrollToBottom(), 0);
      }
    });
  }

  clearConversation(): void {
    // Just reset messages UI; backend history remains. Optional: create a new conversation instead
    this.messages = [{
      type: 'ai',
      content: 'Hello! I am your medical AI assistant. How can I help you today?',
      timestamp: new Date()
    }];
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Conversation cleared (local view)'
    });
    setTimeout(() => this.scrollToBottom(), 0);
  }


  onEnter(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  sendMessage(): void {


    const content = this.userInput.trim();
    if (!content) return;
    if (!this.conversationId) {
      // Create a conversation on-the-fly then send
      this.medicalAIService.createConversation(this.userId).subscribe({
        next: (r: any) => { this.conversationId = r?.data?.id; this.sendMessage(); },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Could not create conversation' })
      });
      return;
    }



    // Optimistically render user message
    this.messages.push({ type: 'user', content, timestamp: new Date() });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.medicalAIService.send(this.conversationId, this.userId, content).subscribe({
      next: (res: any) => {
        const ai = res?.assistant ?? res?.raw?.choices?.[0]?.message?.content ?? '...';


        this.messages.push({ type: 'ai', content: ai, timestamp: new Date() });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err: any) => {
        console.error('Error getting AI response:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to get AI response. Please try again.' });
        this.isLoading = false;
      }
    });
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      const container = this.messageContainer.nativeElement;




      container.scrollTop = container.scrollHeight;
    }
  }
}