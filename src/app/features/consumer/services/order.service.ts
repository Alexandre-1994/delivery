// src/app/features/consumer/services/order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
import { CartItem } from './cart.service';

export interface OrderItem {
  dish_id: number;
  quantity: number;
  price: number;
}

export interface OrderCreate {
  address_id: number;
  payment_method: number;
  items: OrderItem[];
  total: number;
}

export interface OrderHistory {
  tracking_id: number;
  restaurant_name: string;
  tracking_number: string;
  status: string;
  shipped_at: string | null;
  delivered_at: string | null;
  dish_name: string;
  dish_image: string;
  dish_description: string;
  quantity: number;
  unit_price: string;
  total_price: number;
  order_created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/customer`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders(this.authService.getAuthHeaders());
  }

  // Criar novo pedido
  createOrder(orderData: OrderCreate): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/order/store`, orderData, { headers });
  }

  // Obter todos os pedidos do usuário
  getOrders(): Observable<OrderHistory[]> {
    const headers = this.getHeaders();
    return this.http.get<OrderHistory[]>(`${this.apiUrl}/my-orders/all`, { headers });
  }

  // Obter detalhes de um pedido específico
  getOrderDetails(orderId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/order/show/${orderId}`, { headers });
  }

  // Preparar dados do carrinho para o formato esperado pela API
  prepareOrderData(
    cartItems: CartItem[], 
    addressId: number, 
    paymentMethodId: number, 
    total: number
  ): OrderCreate {
    return {
      address_id: addressId,
      payment_method: paymentMethodId,
      items: cartItems.map(item => ({
        dish_id: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      total
    };
  }
}