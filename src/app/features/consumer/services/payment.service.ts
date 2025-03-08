// src/app/features/consumer/services/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

interface MpesaDetails {
  id: number;
  payment_method_id: number;
  phone_number: string;
  account_name: string;
  created_at: string;
  updated_at: string;
}

interface CardDetails {
  // Adicione os campos necessários para cartão quando implementar
}

interface EmolaDetails {
  // Adicione os campos necessários para Emola quando implementar
}

export interface PaymentMethod {
  data: any;
  id: number;
  customer_id: number;
  type: 'mpesa' | 'card' | 'emola';
  title: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  card_details: CardDetails | null;
  emola_details: EmolaDetails | null;
  mpesa_details: MpesaDetails | null;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/customer/payments`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders(this.authService.getAuthHeaders());
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() });
  }

  addPaymentMethod(paymentMethod: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(`${this.apiUrl}/store`, paymentMethod, { headers: this.getHeaders() });
  }

  updatePaymentMethod(id: number, paymentMethod: Partial<PaymentMethod>): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/update/${id}`, paymentMethod, { headers: this.getHeaders() });
  }

  deletePaymentMethod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getHeaders() });
  }

  setDefaultPaymentMethod(id: number): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/set-default/${id}`, {}, { headers: this.getHeaders() });
  }
}