import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ContactMessageRequest {
  name: string;
  email: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  baseUrl = `${environment.apiUrl}/contact`;

  constructor(private httpClient: HttpClient) {}

  send(data: ContactMessageRequest) {
    return this.httpClient.post(`${this.baseUrl}/send`, data);
  }
}
