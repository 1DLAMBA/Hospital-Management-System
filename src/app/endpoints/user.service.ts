import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserDTO, UserRequest } from '../../resources/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService{
  baseUrl = `${environment.apiUrl}/user`;

  constructor(private httpClient: HttpClient) { }
  register(data: UserDTO){
    return this.httpClient.post(`${this.baseUrl}/register`, data);

    
  }
  // Shared sign-in for users, admins and hospitals; the response's user_type says which.
  login(data: UserRequest){
    return this.httpClient.post(`${environment.apiUrl}/auth/login`, data);
  }

  get(id: number){
    return this.httpClient.get(`${this.baseUrl}/get/${id}`);

  }

  verifyOtp(data: { user_id: number; otp: string }){
    return this.httpClient.post(`${this.baseUrl}/verify-otp`, data);
  }

  regenerateOtp(data: { user_id: number }){
    return this.httpClient.post(`${this.baseUrl}/regenerate-otp`, data);
  }

  // Verify email from the link the user clicked in their inbox.
  verifyEmail(token: string){
    return this.httpClient.post(`${this.baseUrl}/verify-email`, { token });
  }

  // Resend the email verification link.
  resendVerification(data: { user_id: number }){
    return this.httpClient.post(`${this.baseUrl}/resend-verification`, data);
  }

  patchProfile(userId: number | string, body: { passport?: string }) {
    return this.httpClient.put(`${this.baseUrl}/patch/${userId}`, body);
  }

}
