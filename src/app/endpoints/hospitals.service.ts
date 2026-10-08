import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface HospitalRequest {
  name: string;
  address: string;
  phoneno: string;
  email: string;
  registration_number?: string;
  password: string;
  password_confirmation: string;
}

export interface HospitalResource {
  id: number;
  name: string;
  address: string;
  phoneno: string;
  email: string;
  registration_number?: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class HospitalsService {
  baseUrl = `${environment.apiUrl}/hospital`;

  constructor(private httpClient: HttpClient) { }

  register(data: HospitalRequest) {
    return this.httpClient.post(`${this.baseUrl}/register`, data);
  }

  getAll() {
    return this.httpClient.get(`${this.baseUrl}/get`);
  }

  getSingle(id: any) {
    return this.httpClient.get(`${this.baseUrl}/get/${id}`);
  }

  // Identity comes from the bearer token, not the id — kept as a parameter
  // so this matches the get(id) shape other endpoint services use.
  get(_id?: any) {
    return this.httpClient.get(`${this.baseUrl}/me`);
  }

  getStaff() {
    return this.httpClient.get(`${this.baseUrl}/me/staff`);
  }
}
