import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BankAccount, Bank, ResolveAccountResponse } from '../models/bank-account.model';

interface ApiResponse<T> {
  bank_account?: T;
  banks?: T;
  account_name?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BankAccountService {
  private baseUrl = `${environment.apiUrl}`;
  private userId: string | null = null;

  constructor(private http: HttpClient) { }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private getUserIdParam(): string {
    return this.userId ? `?user_id=${this.userId}` : '';
  }

  getBankAccount(): Observable<ApiResponse<BankAccount>> {
    return this.http.get<ApiResponse<BankAccount>>(`${this.baseUrl}/bank-account${this.getUserIdParam()}`);
  }

  createBankAccount(data: Partial<BankAccount>): Observable<ApiResponse<BankAccount>> {
    const payload = { ...data, user_id: this.userId };
    return this.http.post<ApiResponse<BankAccount>>(`${this.baseUrl}/bank-account`, payload);
  }

  updateBankAccount(id: number, data: Partial<BankAccount>): Observable<ApiResponse<BankAccount>> {
    const payload = { ...data, user_id: this.userId };
    return this.http.put<ApiResponse<BankAccount>>(`${this.baseUrl}/bank-account/${id}`, payload);
  }

  deleteBankAccount(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.baseUrl}/bank-account/${id}${this.getUserIdParam()}`);
  }

  getBanks(): Observable<ApiResponse<Bank[]>> {
    return this.http.get<ApiResponse<Bank[]>>(`${this.baseUrl}/banks`);
  }

  resolveAccount(accountNumber: string, bankCode: string): Observable<ResolveAccountResponse> {
    return this.http.post<ResolveAccountResponse>(`${this.baseUrl}/bank-account/resolve`, {
      account_number: accountNumber,
      bank_code: bankCode
    });
  }
}
