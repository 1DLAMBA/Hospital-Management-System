import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MedicalRecordResource, MedicalRecordRequest } from '../../resources/medicalrecord.model';


@Injectable({
  providedIn: 'root'
})
export class MedicalService {
  baseUrl = `${environment.apiUrl}/medical`;

  constructor(private httpClient: HttpClient) { }

  create(data: any) {
    return this.httpClient.post(`${this.baseUrl}/create`, data)
  }
 
  edit(id: any, status:any){
    return this.httpClient.post(`${this.baseUrl}/edit/${id}`, status)
  }
  
  get(id: any) {
    return this.httpClient.get(`${this.baseUrl}/get/${id}`)
  }
}
