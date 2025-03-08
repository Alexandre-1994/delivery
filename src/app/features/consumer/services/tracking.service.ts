import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

export interface TrackingInfo {
  id: number;
  order_item_id: number;
  tracking_number: string;
  status: string;
  driver_latitude: string;
  driver_longitude: string;
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
  destination_latitude: string;
  destination_longitude: string;
  addres_info: {
    id: number;
    customer_id: number;
    address_name: string;
    recipient_name: string;
    phone: string;
    street: string;
    reference: string;
    neighborhood: string;
    block: string;
    city: string;
    province: string;
    country: string;
    addressLat: string;
    addressLng: string;
  };
  restaurant_info: {
    id: number;
    name: string;
    addressLat: string;
    addressLng: string;
    province: string;
    city: string;
    street: string;
    neighborhood: string;
  };
  order_item: {
    id: number;
    quantity: number;
    price: string;
    order_id: number;
    dish_id: number;
    status: string;
    dish: {
      id: number;
      name: string;
      description: string;
      price: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = `${environment.apiUrl}/customer/track_order`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getTrackingInfo(orderId: number): Observable<TrackingInfo> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<TrackingInfo>(`${this.apiUrl}/${orderId}`, { headers });
  }

  calculateDistance(lat1: string, lon1: string, lat2: string, lon2: string): number {
    const R = 6371; // Raio da Terra em km
    const lat1Num = parseFloat(lat1);
    const lon1Num = parseFloat(lon1);
    const lat2Num = parseFloat(lat2);
    const lon2Num = parseFloat(lon2);

    const dLat = this.deg2rad(lat2Num - lat1Num);
    const dLon = this.deg2rad(lon2Num - lon1Num);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1Num)) * Math.cos(this.deg2rad(lat2Num)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distância em km
    
    return Math.round(distance * 10) / 10; // Arredonda para 1 casa decimal
  }

  estimateDeliveryTime(distanceKm: number): number {
    // Velocidade média estimada de 30 km/h para áreas urbanas
    const averageSpeed = 30;
    // Tempo em minutos = (distância / velocidade) * 60
    return Math.round(distanceKm / averageSpeed * 60);
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
} 