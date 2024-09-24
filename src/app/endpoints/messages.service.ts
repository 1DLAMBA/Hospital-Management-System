import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  baseUrl = `${environment.apiUrl}/messages`;


  constructor(private httpClient: HttpClient) { }

  sendMessage(message: any) {
    return this.httpClient.post(`${this.baseUrl}/send`, message);
  }
  
  markAsDelivered(messageId: number) {
    return this.httpClient.post(`${this.baseUrl}/delivered`, { messageId });
  }
  
  markAsSeen(messageId: number) {
    return this.httpClient.post(`${this.baseUrl}/seen`, { messageId });
  }
  
  getMessageHistory(formData:any) {
    return this.httpClient.post(`${this.baseUrl}/history`, formData);
  }
  

}
