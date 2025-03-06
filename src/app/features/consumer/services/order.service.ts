// src/app/features/consumer/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CartItem } from './cart.service';

export interface OrderCreate {
  restaurant_id: number;
  items: {
    id: number;
    quantity: number;
    notes?: string;
  }[];
  subtotal: number;
  delivery_fee: number;
  discount: number;
  total: number;
  notes?: string;
  coupon_code?: string;
  // Adicione outros campos necessários para a API

  
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
    private apiUrl = 'http://127.0.0.1:8000/api/customer/my-orders/all';

  constructor(private http: HttpClient) {}

  // Criar novo pedido
  createOrder(orderData: OrderCreate): Observable<any> {
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

  // Preparar dados do carrinho para o formato esperado pela API
  prepareOrderData(cartItems: CartItem[], restaurant: any, subtotal: number, deliveryFee: number, discount: number, total: number, notes?: string, couponCode?: string): OrderCreate {
    return {
      restaurant_id: restaurant.id,
      items: cartItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        notes: item.notes
      })),
      subtotal,
      delivery_fee: deliveryFee,
      discount,
      total,
      notes,
      coupon_code: couponCode
    };
  }
}