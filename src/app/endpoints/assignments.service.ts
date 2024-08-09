import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AssigmentRequest, AssigmentResourse } from '../../resources/assignment.model';


@Injectable({
  providedIn: 'root'
})
export class AssignmentsService {

  baseUrl = `${environment.apiUrl}/assignment`;

  constructor(private httpClient: HttpClient) { }

  create(data: AssigmentRequest) {
    return this.httpClient.post(`${this.baseUrl}/create`, data)
  }
 
  edit(id: any, status:any){
    return this.httpClient.post(`${this.baseUrl}/statusedit/${id}`, status)
  }
  
  get(id: any) {
    return this.httpClient.get(`${this.baseUrl}/get/${id}`)
  }

  getSingle(id: any) {
    return this.httpClient.get(`${this.baseUrl}/getSingle/${id}`)
  }
}
