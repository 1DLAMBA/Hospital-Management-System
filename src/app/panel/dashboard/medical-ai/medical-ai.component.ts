import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { MessageService } from 'primeng/api';
import { MedicalAIService } from '../../../../app/endpoints/medical-ai.service';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const STORAGE_KEY = 'medical_ai_conversation';

@Component({
  selector: 'app-medical-ai',
  templateUrl: './medical-ai.component.html',
  styleUrls: ['./medical-ai.component.css'],
  host: {
    class: 'medical-ai-host',
  },
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextareaModule],
})
export class MedicalAIComponent implements OnInit, OnDestroy, AfterViewChecked, OnChanges {
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  @Input() dialogVisible = false;
  @Output() ready = new EventEmitter<void>();

  messages: any[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  conversationId?: number;
  userId!: number;

  private initialLoadFinished = false;
  private scrollPending = false;

  constructor(
    private medicalAIService: MedicalAIService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.userId = this.getCurrentUserId();
    this.medicalAIService.getConversations(this.userId).subscribe({
      next: (res: any) => {
        const convos = res?.data || [];
        if (convos.length === 0) {
          this.medicalAIService.createConversation(this.userId).subscribe({
            next: (r: any) => {
              this.conversationId = r?.data?.id;
              this.loadMessages();
            },
            error: () => this.finishInitialLoad(),
          });
        } else {
          this.conversationId = convos[0].id;
          this.loadMessages();
        }
      },
      error: () => this.finishInitialLoad(),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dialogVisible']?.currentValue === true) {
      this.scheduleScrollToBottom();
    }
  }

  ngAfterViewChecked(): void {
    if (!this.scrollPending || !this.messageContainer) {
      return;
    }
    const el = this.messageContainer.nativeElement;
    el.scrollTop = el.scrollHeight;
    this.scrollPending = false;
  }

  ngOnDestroy(): void {}

  scheduleScrollToBottom(): void {
    this.scrollPending = true;
  }

  private finishInitialLoad(): void {
    if (this.initialLoadFinished) {
      return;
    }
    this.initialLoadFinished = true;
    setTimeout(() => this.ready.emit(), 0);
  }

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
    } catch {
      return 0;
    }
  }

  private loadMessages(): void {
    if (!this.conversationId) {
      this.applyWelcomeMessage();
      this.finishInitialLoad();
      return;
    }
    this.medicalAIService.getMessages(this.conversationId).subscribe({
      next: (r: any) => {
        const data = r?.data || [];
        this.messages = data.map((m: any) => ({
          type: m.role === 'assistant' ? 'ai' : 'user',
          content: m.content,
          timestamp: new Date(m.created_at),
        }));
        if (this.messages.length === 0) {
          try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              const parsed = JSON.parse(stored);
              this.messages = (parsed || []).map((msg: any) => ({
                type: msg.type,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
              }));
            }
          } catch {}
          if (this.messages.length === 0) {
            this.applyWelcomeMessage();
          }
        }
        this.scheduleScrollToBottom();
        this.finishInitialLoad();
      },
      error: () => {
        this.applyWelcomeMessage();
        this.finishInitialLoad();
      },
    });
  }

  private applyWelcomeMessage(): void {
    this.messages = [
      {
        type: 'ai',
        content: 'Hello! I am your medical AI assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ];
    this.scheduleScrollToBottom();
  }

  clearConversation(): void {
    this.messages = [
      {
        type: 'ai',
        content: 'Hello! I am your medical AI assistant. How can I help you today?',
        timestamp: new Date(),
      },
    ];
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Conversation cleared (local view)',
    });
    this.scheduleScrollToBottom();
  }

  onEnter(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  sendMessage(): void {
    const content = this.userInput.trim();
    if (!content) return;
    if (!this.conversationId) {
      this.medicalAIService.createConversation(this.userId).subscribe({
        next: (r: any) => {
          this.conversationId = r?.data?.id;
          this.sendMessage();
        },
        error: () =>
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Could not create conversation',
          }),
      });
      return;
    }

    this.messages.push({ type: 'user', content, timestamp: new Date() });
    this.userInput = '';
    this.scheduleScrollToBottom();
    this.isLoading = true;
    this.scheduleScrollToBottom();

    this.medicalAIService.send(this.conversationId, this.userId, content).subscribe({
      next: (res: any) => {
        const ai =
          res?.assistant ?? res?.raw?.choices?.[0]?.message?.content ?? '...';
        this.messages.push({ type: 'ai', content: ai, timestamp: new Date() });
        this.isLoading = false;
        this.scheduleScrollToBottom();
      },
      error: (err: any) => {
        console.error('Error getting AI response:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to get AI response. Please try again.',
        });
        this.isLoading = false;
        this.scheduleScrollToBottom();
      },
    });
  }

  scrollToBottom(): void {
    this.scheduleScrollToBottom();
  }
}
