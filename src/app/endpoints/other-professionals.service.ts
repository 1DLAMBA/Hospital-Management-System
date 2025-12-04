import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { OtherProfessionalRequest, OtherProfessionalResource } from '../../resources/other-professional.model';

@Injectable({
  providedIn: 'root'
})
export class OtherProfessionalsService {
  baseUrl = `${environment.apiUrl}/other-professional`;

  constructor(private httpClient: HttpClient) { }

  create(data: OtherProfessionalRequest){
    return this.httpClient.post(`${this.baseUrl}/create`, data);
  }

  get(search?: string, page: number = 1, perPage: number = 10){
    let params: any = {
      page: page.toString(),
      per_page: perPage.toString()
    };
    
    if (search && search.trim() !== '') {
      params.search = search.trim();
    }
    
    return this.httpClient.get(`${this.baseUrl}/get`, { params });
  }
  
  getSingle(id: any){
    return this.httpClient.get(`${this.baseUrl}/get/${id}`);
  }

  getOtherProfessionalUser(id: any){
    return this.httpClient.get(`${this.baseUrl}/user/get/${id}`);
  }
}

