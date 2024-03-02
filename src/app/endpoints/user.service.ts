import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserRequest } from '../../resources/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService{
  baseUrl = `${environment.apiUrl}/user`;  

  constructor(private httpClient: HttpClient) { }
  register(){
    
  }
  login(data: UserRequest){
    return this.httpClient.post(`${this.baseUrl}/login`, data);
  }

}
