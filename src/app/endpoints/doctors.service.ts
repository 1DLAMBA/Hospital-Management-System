import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DoctorRequest, DoctorResource } from '../../resources/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  baseUrl = `${environment.apiUrl}/doctor`;

  constructor(private httpClient: HttpClient) { }

  create(data: DoctorRequest){
    return this.httpClient.post(`${this.baseUrl}/create`, data);
  }


  get(){
    return this.httpClient.get(`${this.baseUrl}/get`);
  }

  getSingle(id:any){
    return this.httpClient.get(`${this.baseUrl}/get/${id}`);
  }

  getDocUser(id:any){
    return this.httpClient.get(`${this.baseUrl}/user/get/${id}`);
  }
}
