import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MedicalAIService {
  private baseUrl = environment.apiUrl + '/medical-ai';
  private groqApiKey = environment.groqApiKey;

  constructor(private http: HttpClient) { }

  getAIResponse(question: string): Observable<any> {
    const headers = {
      'Authorization': `Bearer ${this.groqApiKey}`,
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