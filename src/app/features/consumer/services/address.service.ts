// src/app/features/consumer/services/address.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

export interface Address {
  latitude: any;
  longitude: any;
  id: number;
  customer_id: number;
  address_name: string;
  recipient_name: string;
  phone: string;
  street: string;
  reference?: string;
  neighborhood: string;
  block: string;
  city: string;
  province: string;
  zip_code?: string;
  country: string;
  addressLat: string;
  addressLng: string;
  is_default: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/customer/address`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders(this.authService.getAuthHeaders());
  }

  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(`${this.apiUrl}/list`, { headers: this.getHeaders() });
  }

  addAddress(address: Partial<Address>): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/store`, address, { headers: this.getHeaders() });
  }

  updateAddress(id: number, address: Partial<Address>): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/update/${id}`, address, { headers: this.getHeaders() });
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`, { headers: this.getHeaders() });
  }
}