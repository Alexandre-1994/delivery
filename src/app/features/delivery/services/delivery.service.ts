import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';

export interface Delivery {
  id: string;
  status: string;
  customer_name: string;
  customer_address: string;
  restaurant_name: string;
  restaurant_address: string;
  items: any[];
  total: number;
  created_at: string;
  updated_at: string;
  // Adicione outros campos conforme necessário
}

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private currentDeliverySubject = new BehaviorSubject<Delivery | null>(null);

  constructor(private apiService: ApiService) {}

  getAvailableDeliveries(): Observable<Delivery[]> {
    return this.apiService.getAvailableDeliveries().pipe(
      map((response: any) => response.data || [])
    );
  }

  getDeliveryHistory(): Observable<Delivery[]> {
    return this.apiService.getDeliveryHistory().pipe(
      map((response: any) => response.data || [])
    );
  }

  acceptDelivery(id: number): Observable<any> {
    return this.apiService.acceptDelivery(id).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.currentDeliverySubject.next(response.data);
        }
      })
    );
  }

  markAsCollected(id: number): Observable<any> {
    return this.apiService.markAsCollected(id).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.currentDeliverySubject.next(response.data);
        }
      })
    );
  }

  markAsDelivered(id: number): Observable<any> {
    return this.apiService.markAsDelivered(id).pipe(
      tap((response: any) => {
        if (response.success) {
          this.currentDeliverySubject.next(null);
        }
      })
    );
  }

  getCurrentDelivery(): Observable<Delivery | null> {
    return this.currentDeliverySubject.asObservable();
  }

  setCurrentDelivery(delivery: Delivery): void {
    this.currentDeliverySubject.next(delivery);
  }

  clearCurrentDelivery(): void {
    this.currentDeliverySubject.next(null);
  }
}