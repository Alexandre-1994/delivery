import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface DeliveryHistory {
  id: string;
  orderNumber: string;
  date: Date;
  restaurantName: string;
  customerAddress: string;
  status: 'completed' | 'cancelled';
  earnings: number;
  distance: number;
  deliveryTime: number;
}

@Component({
  selector: 'app-delivery-history',
  templateUrl: './delivery-history.component.html',
  styleUrls: ['./delivery-history.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class DeliveryHistoryComponent  implements OnInit {

  selectedPeriod: 'today' | 'week' | 'month' = 'today';
  deliveries: DeliveryHistory[] = [];
  filteredDeliveries: DeliveryHistory[] = [];
  groupedDeliveries: Map<string, DeliveryHistory[]> = new Map();

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockData();
    this.filterDeliveries();
  }

  loadMockData() {
    // Dados de exemplo para os últimos 30 dias
    const now = new Date();
    this.deliveries = [
      {
        id: '1',
        orderNumber: 'OD123456',
        date: new Date(),
        restaurantName: 'Restaurante Tradicional',
        customerAddress: 'Avenida Central, 456',
        status: 'completed',
        earnings: 0,
        distance: 3.5,
        deliveryTime: 25
      },
      {
        id: '2',
        orderNumber: 'OD123457',
        date: new Date(now.setHours(now.getHours() - 2)),
        restaurantName: 'Pizza Express',
        customerAddress: 'Rua 2, 789',
        status: 'completed',
        earnings: 1200,
        distance: 2.8,
        deliveryTime: 20
      },
      // Adicione mais entregas conforme necessário
    ];
  }

  filterDeliveries() {
    const now = new Date();
    const startDate = new Date();

    switch (this.selectedPeriod) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    this.filteredDeliveries = this.deliveries.filter(
      delivery => delivery.date >= startDate
    );

    this.groupDeliveriesByDate();
  }

  groupDeliveriesByDate() {
    this.groupedDeliveries = this.filteredDeliveries.reduce((groups, delivery) => {
      const date = delivery.date.toLocaleDateString();
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)?.push(delivery);
      return groups;
    }, this.groupedDeliveries);
  }

  getTotalEarnings(): number {
    return this.filteredDeliveries.reduce(
      (total, delivery) => total + delivery.earnings, 0
    );
  }

  getTotalDeliveries(): number {
    return this.filteredDeliveries.length;
  }

  getTotalDistance(): number {
    return this.filteredDeliveries.reduce(
      (total, delivery) => total + delivery.distance, 0
    );
  }

  getAverageDeliveryTime(): number {
    if (this.filteredDeliveries.length === 0) return 0;
    const total = this.filteredDeliveries.reduce(
      (sum, delivery) => sum + delivery.deliveryTime, 0
    );
    return Math.round(total / this.filteredDeliveries.length);
  }

  showDeliveryDetails(delivery: DeliveryHistory) {
    // Implementar visualização detalhada da entrega
    console.log('Detalhes da entrega:', delivery);
  }

}
