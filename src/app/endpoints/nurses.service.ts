import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { NurseRequest, NurseResource } from '../../resources/nurse.model';

@Injectable({
  providedIn: 'root'
})
export class NursesService {
  baseUrl = `${environment.apiUrl}/nurse`;

  constructor(private httpClient: HttpClient) { }

  create(data: NurseRequest){
    return this.httpClient.post(`${this.baseUrl}/create`, data);
  }

  get(){
    return this.httpClient.get(`${this.baseUrl}/get`);
  }
  getSingle(id:any){
    return this.httpClient.get(`${this.baseUrl}/get/${id}`);
  }
}
