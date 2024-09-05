import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ConversationService {
  baseUrl = `${environment.apiUrl}/messages`;


  constructor(private http: HttpClient) {}

  // Fetch all conversations for the logged-in user
  getConversations(): Observable<any> {
    return this.http.get(`${this.baseUrl}/conversations`);
  }

  // Create a new conversation between two users
  createConversation(userOneId: number, userTwoId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/conversations`, { user_one_id: userOneId, user_two_id: userTwoId });
  }
}
