// src/app/features/consumer/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PaymentMethod {
  id: number;
  type: 'money' | 'mpesa' | 'emola' | 'bank_card';
  number?: string;
  holder_name?: string;
  last4?: string;
  is_default: boolean;
}

export interface PaymentMethodResponse {
  data: PaymentMethod[];
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payment-methods`;

  constructor(private http: HttpClient) {}

  getPaymentMethods(): Observable<PaymentMethodResponse> {
    return this.http.get<PaymentMethodResponse>(this.apiUrl);
  }

  addPaymentMethod(payment: Partial<PaymentMethod>): Observable<{data: PaymentMethod}> {
    return this.http.post<{data: PaymentMethod}>(this.apiUrl, payment);
  }

  updatePaymentMethod(id: number, payment: Partial<PaymentMethod>): Observable<{data: PaymentMethod}> {
    return this.http.put<{data: PaymentMethod}>(`${this.apiUrl}/${id}`, payment);
  }

  deletePaymentMethod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}