import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdminResource {
  id: number;
  name: string;
  staff_id: string;
  email: string;
  phoneno: string;
  user_type: 'admin';
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = `${environment.apiUrl}/admin`;

  constructor(private httpClient: HttpClient) { }

  get(id: any) {
    return this.httpClient.get(`${this.baseUrl}/me/${id}`);
  }

  getAllUsers() {
    // UserController@index (reused by /admin/users) returns the full list,
    // with no server-side pagination/search.
    return this.httpClient.get(`${this.baseUrl}/users`);
  }

  getAllHospitals(status?: string, page: number = 1, perPage: number = 10) {
    const params: any = { page, per_page: perPage };
    if (status) params.status = status;
    return this.httpClient.get(`${this.baseUrl}/hospitals`, { params });
  }

  approveHospital(id: any) {
    return this.httpClient.post(`${this.baseUrl}/hospitals/${id}/approve`, {});
  }

  rejectHospital(id: any) {
    return this.httpClient.post(`${this.baseUrl}/hospitals/${id}/reject`, {});
  }
}
