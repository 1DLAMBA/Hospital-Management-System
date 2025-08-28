import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalAIService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }
  

  getConversations(userId: number) {
    return this.http.get(`${this.baseUrl}/ai/conversations?user_id=${userId}`);
  }
  createConversation(userId: number, payload: { title?: string; system_prompt?: string; model?: string } = {}) {
    return this.http.post(`${this.baseUrl}/ai/conversations`, { user_id: userId, ...payload });
  }
  getMessages(convoId: number) {
    return this.http.get(`${this.baseUrl}/ai/conversations/${convoId}/messages`);
  }
  send(convoId: number, userId: number, content: string) {
    return this.http.post(`${this.baseUrl}/ai/conversations/${convoId}/send`, { user_id: userId, content });
  }

  getAIResponse(question: string, key: string): Observable<any> {
    const headers = {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };

    const body = {
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant specialized in healthcare and medical information. Provide accurate, evidence-based medical information while maintaining patient confidentiality and ethical standards.'
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    return this.http.post('https://api.groq.com/openai/v1/chat/completions', body, { headers });
  }
} 