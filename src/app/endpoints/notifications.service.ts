import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Notification {
  id: number;
  user_id: number;
  type: 'appointment_booking' | 'appointment_accepted' | 'medical_record_created' | 'message';
  title: string;
  message: string;
  related_id: number | null;
  related_type: string | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private httpClient: HttpClient) { }

  getNotifications(userId: number): Observable<{ notifications: Notification[] }> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.httpClient.get<{ notifications: Notification[] }>(this.baseUrl, { params });
  }

  getUnreadNotifications(userId: number): Observable<{ notifications: Notification[], unread_count: number }> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.httpClient.get<{ notifications: Notification[], unread_count: number }>(`${this.baseUrl}/unread`, { params });
  }

  getNotificationCount(userId: number): Observable<{ unread_count: number, total_count: number }> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.httpClient.get<{ unread_count: number, total_count: number }>(`${this.baseUrl}/count`, { params });
  }

  markAsRead(notificationId: number, userId: number): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/${notificationId}/read`, { user_id: userId });
  }

  markAllAsRead(userId: number): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/read-all`, { user_id: userId });
  }

  deleteNotification(notificationId: number, userId: number): Observable<any> {
    const params = new HttpParams().set('user_id', userId.toString());
    return this.httpClient.delete(`${this.baseUrl}/${notificationId}`, { params });
  }
}

