import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ClientResource, ClientsRequest } from '../../resources/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  baseUrl = `${environment.apiUrl}/client`;

  constructor(private httpClient: HttpClient) { }
  create(data: ClientsRequest){
    return this.httpClient.post(`${this.baseUrl}/create`, data);
  }
}
