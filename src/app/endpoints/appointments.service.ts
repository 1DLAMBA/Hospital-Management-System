import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AppointmentRequest, AppointmentResource } from '../../resources/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {

  baseUrl = `${environment.apiUrl}/appointment`;

  constructor(private httpClient: HttpClient) { }

  create(data: AppointmentRequest) {
    return this.httpClient.post(`${this.baseUrl}/create`, data)
  }

  edit(id: any, status:any){
    return this.httpClient.post(`${this.baseUrl}/statusedit/${id}`, status)
  }
  
  get(id: any, user_type: any) {
    switch (user_type) {
      case 'doctor':
        return this.httpClient.get(`${this.baseUrl}/doctor/get/${id}`)

        break;
      case 'admin':
        return this.httpClient.get(`${this.baseUrl}/admin/get/${id}`)

        break;
      case 'client':
        return this.httpClient.get(`${this.baseUrl}/client/get/${id}`)

        break;

      default:
        return this.httpClient.get(`${this.baseUrl}/get/${id}`)

        break;
    }
  }
  getSingle(id: any){
    return this.httpClient.get(`${this.baseUrl}/get/${id}`)
    
  }
  delete(id: any) {
    return this.httpClient.delete(`${this.baseUrl}/delete/${id}`)
  }
}
