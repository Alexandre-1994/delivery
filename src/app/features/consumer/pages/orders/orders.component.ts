import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService, OrderHistory } from '../../services/order.service';
import { OrderTrackingComponent } from '../../components/order-tracking/order-tracking.component';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  timeOutline,
  restaurantOutline,
  bicycleOutline,
  checkmarkOutline,
  closeOutline,
  alertCircleOutline,
  refreshOutline,
  calendarOutline,
  cashOutline,
  cardOutline,
  flagOutline,
  homeOutline,
  fastFoodOutline
} from 'ionicons/icons';

// Registrar os ícones
addIcons({
  'location-outline': locationOutline,
  'time-outline': timeOutline,
  'restaurant-outline': restaurantOutline,
  'bicycle-outline': bicycleOutline,
  'checkmark-outline': checkmarkOutline,
  'close-outline': closeOutline,
  'alert-circle-outline': alertCircleOutline,
  'refresh-outline': refreshOutline,
  'calendar-outline': calendarOutline,
  'cash-outline': cashOutline,
  'card-outline': cardOutline,
  'flag-outline': flagOutline,
  'home-outline': homeOutline,
  'fast-food-outline': fastFoodOutline
});

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule, OrderTrackingComponent]
})
export class OrdersComponent implements OnInit {
  orders: OrderHistory[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private modalCtrl: ModalController
  ) {}

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
      case 'preparing':
        return 'primary';
      case 'in-transit':
        return 'tertiary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
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

  formatCurrency(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    }).format(numValue);
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

  async showTracking(orderId: number) {
    const modal = await this.modalCtrl.create({
      component: OrderTrackingComponent,
      componentProps: {
        orderId: orderId
      },
      breakpoints: [0, 0.5, 0.8, 1],
      initialBreakpoint: 0.8
    });

    await modal.present();
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'preparing': 'Em Preparação',
      'ready': 'Pronto para Entrega',
      'in-transit': 'Em Transito',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  canTrackOrder(status: string): boolean {
    const trackableStatus = ['pending', 'preparing', 'ready', 'in-transit'];
    return trackableStatus.includes(status.toLowerCase());
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'time-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'in-transit':
        return 'bicycle-outline';
      case 'delivered':
        return 'checkmark-outline';
      case 'cancelled':
        return 'close-outline';
      case 'ready':
        return 'flag-outline';
      default:
        return 'alert-circle-outline';
    }
  }
}
