// src/app/features/consumer/services/address.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Address {
  id: number;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  complement?: string;
  reference?: string;
  is_default: boolean;
}

export interface AddressResponse {
  data: Address[];
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = `${environment.apiUrl}/customer/address/list`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<AddressResponse> {
    return this.http.get<AddressResponse>(this.apiUrl);
  }

  addAddress(address: Partial<Address>): Observable<{data: Address}> {
    return this.http.post<{data: Address}>(this.apiUrl, address);
  }

  updateAddress(id: number, address: Partial<Address>): Observable<{data: Address}> {
    return this.http.put<{data: Address}>(`${this.apiUrl}/${id}`, address);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
