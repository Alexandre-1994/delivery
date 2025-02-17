import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

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
  selector: 'app-available-orders',
  templateUrl: './available-orders.component.html',
  styleUrls: ['./available-orders.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ]
})
export class AvailableOrdersComponent  implements OnInit {
  selectedSegment: 'active' | 'history' = 'active';
  activeOrders: Order[] = [];
  orderHistory: Order[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    // Carregar pedidos de exemplo
    this.loadMockOrders();
  }

  loadMockOrders() {
    // Pedidos ativos de exemplo
    this.activeOrders = [
      {
        id: '1',
        orderNumber: 'OD123456',
        restaurantName: 'Restaurante Tradicional',
        status: 'preparing',
        items: [
          { id: 1, name: 'Mufete Tradicional', quantity: 1, price: 5000 },
          { id: 2, name: 'Sumo de Múcua', quantity: 2, price: 1500 }
        ],
        total: 8000,
        date: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60000), // +30 minutos
        deliveryAddress: 'Rua Principal, 123 - Centro',
        paymentMethod: 'Cartão de Crédito'
      }
    ];

    // Histórico de pedidos
    this.orderHistory = [
      {
        id: '2',
        orderNumber: 'OD123455',
        restaurantName: 'Pizza Express',
        status: 'delivered',
        items: [
          { id: 3, name: 'Pizza Grande', quantity: 1, price: 4500 }
        ],
        total: 4500,
        date: new Date(Date.now() - 24 * 60 * 60000), // Ontem
        estimatedDeliveryTime: new Date(Date.now() - 24 * 60 * 60000),
        deliveryAddress: 'Rua Principal, 123 - Centro',
        paymentMethod: 'Dinheiro'
      }
    ];
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  getStatusColor(status: string): string {
    const colors = {
      pending: 'warning',
      confirmed: 'primary',
      preparing: 'primary',
      delivering: 'tertiary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status as keyof typeof colors] || 'medium';
  }

  isStepCompleted(order: Order, step: string): boolean {
    const steps = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered'];
    const currentIndex = steps.indexOf(order.status);
    const stepIndex = steps.indexOf(step);
    return currentIndex >= stepIndex;
  }

  trackOrder(order: Order) {
    // Navegar para a página de rastreamento
    this.router.navigate(['/consumer/orders/track', order.id]);
  }

  viewOrderDetails(order: Order) {
    // Navegar para os detalhes do pedido
    this.router.navigate(['/consumer/orders/details', order.id]);
  }

  calculateTotal(items: OrderItem[]): number {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  formatOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      delivering: 'A caminho',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
  }

  async cancelOrder(order: Order) {
    // Implementar lógica de cancelamento
    console.log('Cancelando pedido:', order.id);
  }

  async rateOrder(order: Order) {
    // Navegar para a página de avaliação
    this.router.navigate(['/consumer/orders/rate', order.id]);
  }

  async reorder(order: Order) {
    // Implementar lógica de refazer pedido
    console.log('Refazendo pedido:', order.id);
  }
}
