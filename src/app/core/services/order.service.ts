// src/app/features/consumer/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Criar novo pedido
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/customer/order/store`, orderData);
  }

  // Obter todos os pedidos do usuário
  getOrders(status: string = 'all'): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/my-orders/${status}`);
  }

  // Obter detalhes de um pedido específico
  getOrderDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/customer/order/confirm/${id}`);
  }
}