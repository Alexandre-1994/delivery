import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../core/services/auth.service';

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  restaurant_id: number;
}

export interface Restaurant {
  id: number;
  name: string;
  street: string;
  photo: string;
  phone: string;
  email: string;
  addressLat: string;
  addressLng: string;
  neighborhood: string;
  city: string;
  province: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export interface Address {
  id: number;
  street: string;
  reference: string;
  neighborhood: string;
  city: string;
  province: string;
  addressLat: string;
  addressLng: string;
  recipient_name: string;
  phone: string;
}

export interface Order {
  id: number;
  customer_id: number;
  total_price: string;
  payment_method: string;
  status: string;
  address_id: number;
  customer: Customer;
  address: Address;
}

export interface Tracking {
  id: number;
  tracking_number: string;
  status: string;
  driver_latitude: string | null;
  driver_longitude: string | null;
  driver_id: number | null;
  pickup_time: string | null;
  delivery_time: string | null;
}

export interface DeliveryOrder {
  id: number;
  quantity: number;
  price: string;
  order_id: number;
  dish_id: number;
  status: string;
  created_at: string;
  updated_at: string;
  restaurant_id: number;
  dish: Dish;
  restaurant: Restaurant;
  order: Order;
  tracking: Tracking;
}

interface AcceptDeliveryResponse {
  message: string;
  tracking: {
    id: number;
    order_item_id: number;
    tracking_number: string;
    status: string;
    driver_latitude: string | null;
    driver_longitude: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
    driver_id: number | null;
    pickup_time: string | null;
    delivery_time: string | null;
    current_lat: string | null;
    current_lng: string | null;
    pickup_confirmation: boolean;
    delivery_confirmation: boolean;
    customer_rating: number | null;
  };
}

interface CollectDeliveryResponse {
  message: string;
  tracking: {
    id: number;
    order_item_id: number;
    tracking_number: string;
    status: string;
    driver_latitude: string | null;
    driver_longitude: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
    driver_id: number;
    pickup_time: string;
    delivery_time: string | null;
    current_lat: string | null;
    current_lng: string | null;
    pickup_confirmation: boolean;
    delivery_confirmation: boolean;
    customer_rating: number | null;
  };
  orderItem: {
    id: number;
    quantity: number;
    price: string;
    order_id: number;
    dish_id: number;
    status: string;
    created_at: string;
    updated_at: string;
    restaurant_id: number;
  };
}

interface CompleteDeliveryResponse {
  message: string;
  tracking: {
    id: number;
    order_item_id: number;
    tracking_number: string;
    status: string;
    driver_latitude: string | null;
    driver_longitude: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string;
    updated_at: string;
    driver_id: number;
    pickup_time: string;
    delivery_time: string;
    current_lat: string | null;
    current_lng: string | null;
    pickup_confirmation: boolean;
    delivery_confirmation: boolean;
    customer_rating: number | null;
  };
  orderItem: {
    id: number;
    quantity: number;
    price: string;
    order_id: number;
    dish_id: number;
    status: string;
    created_at: string;
    updated_at: string;
    restaurant_id: number;
  };
}

export interface CurrentDeliveryTracking {
  id: number;
  tracking_number: string;
  status: string;
  pickup_time: string | null;
  estimated_delivery_time: string | null;
}

export interface CurrentDeliveryOrder {
  id: number;
  order_number: string | null;
  total: string | null;
}

export interface CurrentDeliveryItem {
  id: number;
  dish_name: string;
  quantity: number;
  price: string;
}

export interface CurrentDeliveryRestaurant {
  id: number;
  name: string;
  address: string | null;
  lat: string | null;
  lng: string | null;
  phone: string;
}

export interface CurrentDeliveryCustomer {
  id: number;
  name: string;
  address: string | null;
  lat: string | null;
  lng: string | null;
  phone: string | null;
}

export interface CurrentDelivery {
  tracking: CurrentDeliveryTracking;
  order: CurrentDeliveryOrder;
  item: CurrentDeliveryItem;
  restaurant: CurrentDeliveryRestaurant;
  customer: CurrentDeliveryCustomer;
}

export interface CurrentDeliveryResponse {
  message: string;
  delivery: CurrentDelivery;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAvailableOrders(): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/customer/delivery/list`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getCurrentDelivery(): Observable<CurrentDeliveryResponse> {
    return this.http.get<CurrentDeliveryResponse>(`${this.apiUrl}/customer/driver/current-delivery`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  getDeliveryHistory(): Observable<DeliveryOrder[]> {
    return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/customer/driver/delivery-history`, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updateLocation(latitude: number, longitude: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/driver/location`, {
      latitude,
      longitude
    }, {
      headers: this.authService.getAuthHeaders()
    });
  }

  acceptDelivery(orderId: number): Observable<AcceptDeliveryResponse> {
    return this.http.put<AcceptDeliveryResponse>(
      `${this.apiUrl}/customer/accept/delivery/${orderId}`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }

  collectDelivery(trackingId: number): Observable<CollectDeliveryResponse> {
    return this.http.put<CollectDeliveryResponse>(
      `${this.apiUrl}/customer/collect/delivery/${trackingId}`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }

  completeDelivery(trackingId: number): Observable<CompleteDeliveryResponse> {
    return this.http.put<CompleteDeliveryResponse>(
      `${this.apiUrl}/customer/accept/complete/delivery/${trackingId}`,
      {},
      { headers: this.authService.getAuthHeaders() }
    );
  }
} 