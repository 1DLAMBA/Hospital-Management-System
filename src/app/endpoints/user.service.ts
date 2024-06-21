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
  login(data: UserRequest){
    return this.httpClient.post(`${this.baseUrl}/login`, data);
  }

  get(id: number){
    return this.httpClient.get(`${this.baseUrl}/get/${id}`);

  }

}
