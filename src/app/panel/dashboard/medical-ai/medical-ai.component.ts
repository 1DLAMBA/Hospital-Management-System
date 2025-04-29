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

  constructor(
    private medicalAIService: MedicalAIService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadConversation();
    
    // Add welcome message only if there's no existing conversation
    if (this.messages.length === 0) {
      this.messages.push({
        type: 'ai',
        content: 'Hello! I am your medical AI assistant. How can I help you today?',
        timestamp: new Date()
      });
      this.saveConversation();
    }
  }

  ngAfterViewInit(): void {
    // Scroll to bottom after view is initialized
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  ngOnDestroy(): void {
    this.saveConversation();
  }

  private loadConversation(): void {
    try {
      const storedConversation = localStorage.getItem(STORAGE_KEY);
      if (storedConversation) {
        const parsedMessages = JSON.parse(storedConversation);
        // Convert string timestamps back to Date objects
        this.messages = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load conversation history'
      });
    }
  }

  private saveConversation(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.messages));
    } catch (error) {
      console.error('Error saving conversation:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save conversation history'
      });
    }
  }

  clearConversation(): void {
    this.messages = [{
      type: 'ai',
      content: 'Hello! I am your medical AI assistant. How can I help you today?',
      timestamp: new Date()
    }];
    this.saveConversation();
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Conversation cleared'
    });
    // Scroll to bottom after clearing
    setTimeout(() => {
      this.scrollToBottom();
    }, 0);
  }

  sendMessage(): void {
    if (this.userInput.trim()) {
      // Add user message
      this.messages.push({
        type: 'user',
        content: this.userInput,
        timestamp: new Date()
      });
      this.saveConversation();
      this.scrollToBottom();

      this.isLoading = true;

      // Get AI response
      this.medicalAIService.getAIResponse(this.userInput).subscribe({
        next: (response: any) => {
          const aiResponse = response.choices[0].message.content;
          this.messages.push({
            type: 'ai',
            content: aiResponse,
            timestamp: new Date()
          });
          this.saveConversation();
          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (error: any) => {
          console.error('Error getting AI response:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to get AI response. Please try again.'
          });
          this.isLoading = false;
        }
      });

      this.userInput = '';
    }
  }

  scrollToBottom(): void {
    if (this.messageContainer) {
      const container = this.messageContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    }
  }
} 