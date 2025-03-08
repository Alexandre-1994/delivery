import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderHistory } from '../../services/order.service';
import { addIcons } from 'ionicons';
import {
  receiptOutline,
  alertCircleOutline,
  calendarOutline,
  bicycleOutline,
  checkmarkCircleOutline,
  timeOutline,
  cartOutline,
  restaurantOutline,
  locationOutline,
  callOutline,
  personOutline,
  homeOutline
} from 'ionicons/icons';

// Registrar os ícones
addIcons({
  'receipt-outline': receiptOutline,
  'alert-circle-outline': alertCircleOutline,
  'calendar-outline': calendarOutline,
  'bicycle-outline': bicycleOutline,
  'checkmark-circle-outline': checkmarkCircleOutline,
  'time-outline': timeOutline,
  'cart-outline': cartOutline,
  'restaurant-outline': restaurantOutline,
  'location-outline': locationOutline,
  'call-outline': callOutline,
  'person-outline': personOutline,
  'home-outline': homeOutline
});

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  restaurantName: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  date: Date;
  estimatedDeliveryTime: Date;
  deliveryAddress: string;
  paymentMethod: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class OrdersComponent implements OnInit {
  orders: OrderHistory[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar pedidos:', error);
        this.error = 'Não foi possível carregar seus pedidos. Tente novamente.';
        this.isLoading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'medium';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  }

  doRefresh(event: any) {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        event.target.complete();
      },
      error: (error) => {
        console.error('Erro ao atualizar pedidos:', error);
        this.error = 'Não foi possível atualizar seus pedidos. Tente novamente.';
        event.target.complete();
      }
    });
  }
}