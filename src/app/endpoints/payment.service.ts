import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface InitializePaymentResponse {
  message: string;
  data: {
    authorization_url: string;
    access_code: string | null;
    reference: string;
    amount: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/payment`;

  constructor(private http: HttpClient) { }

  /**
   * Start a consultation payment for an accepted appointment.
   * Returns a Paystack authorization_url to redirect the client to.
   */
  initialize(appointmentId: number, callbackUrl: string) {
    return this.http.post<InitializePaymentResponse>(`${this.baseUrl}/initialize`, {
      appointment_id: appointmentId,
      callback_url: callbackUrl,
    });
  }

  /**
   * Verify a payment after the client returns from Paystack.
   */
  verify(reference: string) {
    return this.http.post<any>(`${this.baseUrl}/verify`, { reference });
  }

  /**
   * A professional's consultation transactions (paid appointments) + earnings summary.
   */
  transactions(userId: number) {
    return this.http.get<any>(`${this.baseUrl}/transactions`, {
      params: { user_id: String(userId) },
    });
  }
}
