import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ProfessionalsQueryParams {
  search?: string;
  type?: 'doctor' | 'nurse' | 'other_professional' | '';
  availability?: 'available' | 'unavailable' | '';
}

export interface ProfessionalsSection<T = unknown> {
  items: T[];
  total: number;
  available?: number;
  unavailable?: number;
}

export interface ProfessionalsResponse {
  sections: {
    doctors?: ProfessionalsSection;
    nurses?: ProfessionalsSection;
    other_professionals?: ProfessionalsSection;
  };
  summary: {
    total: number;
    available: number;
    unavailable: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProfessionalsService {
  private readonly baseUrl = `${environment.apiUrl}/professionals`;

  constructor(private httpClient: HttpClient) {}

  get(params: ProfessionalsQueryParams = {}) {
    let httpParams = new HttpParams();

    if (params.search?.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }
    if (params.type) {
      httpParams = httpParams.set('type', params.type);
    }
    if (params.availability) {
      httpParams = httpParams.set('availability', params.availability);
    }

    return this.httpClient.get<ProfessionalsResponse>(`${this.baseUrl}/get`, { params: httpParams });
  }
}
