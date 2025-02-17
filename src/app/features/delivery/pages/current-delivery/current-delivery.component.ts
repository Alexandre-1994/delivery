import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';

interface DeliveryItem {
  id: number;
  name: string;
  quantity: number;
}

type DeliveryStatus = 'accepted' | 'collecting' | 'delivering' | 'delivered';

interface DeliveryTimeline {
  accepted?: Date;
  collecting?: Date;
  delivering?: Date;
  delivered?: Date;
}

interface CurrentDelivery {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  items: DeliveryItem[];
  timeline: DeliveryTimeline;
}

@Component({
  selector: 'app-current-delivery',
  templateUrl: './current-delivery.component.html',
  styleUrls: ['./current-delivery.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CurrentDeliveryComponent implements OnInit {
  currentDelivery: CurrentDelivery | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadMockDelivery();
  }

  loadMockDelivery() {
    this.currentDelivery = {
      id: '1',
      orderNumber: 'OD123456',
      restaurantName: 'Restaurante Tradicional',
      restaurantAddress: 'Rua Principal, 123 - Centro',
      customerName: 'João Silva',
      deliveryAddress: 'Avenida Central, 456 - Bairro Novo',
      status: 'accepted',
      items: [
        { id: 1, name: 'Mufete Tradicional', quantity: 1 },
        { id: 2, name: 'Sumo de Múcua', quantity: 2 }
      ],
      timeline: {
        accepted: new Date()
      }
    };
  }

  isStepActive(step: DeliveryStatus): boolean {
    const statusOrder: DeliveryStatus[] = ['accepted', 'collecting', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.currentDelivery?.status || 'accepted');
    const stepIndex = statusOrder.indexOf(step);
    return currentIndex >= stepIndex;
  }

  getStepTime(step: keyof DeliveryTimeline): Date | null {
    return this.currentDelivery?.timeline[step] || null;
  }

  getNextActionText(): string {
    switch(this.currentDelivery?.status) {
      case 'accepted':
        return 'Cheguei ao Restaurante';
      case 'collecting':
        return 'Iniciar Entrega';
      case 'delivering':
        return 'Confirmar Entrega';
      case 'delivered':
        return 'Entrega Concluída';
      default:
        return 'Próximo Passo';
    }
  }

  async updateDeliveryStatus() {
    if (!this.currentDelivery) return;

    const statusFlow: Record<DeliveryStatus, DeliveryStatus | undefined> = {
      'accepted': 'collecting',
      'collecting': 'delivering',
      'delivering': 'delivered',
      'delivered': undefined
    };

    const nextStatus = statusFlow[this.currentDelivery.status];
    if (nextStatus) {
      this.currentDelivery.status = nextStatus;
      this.currentDelivery.timeline[nextStatus] = new Date();

      if (nextStatus === 'delivered') {
        setTimeout(() => {
          this.router.navigate(['/delivery/available-orders']);
        }, 2000);
      }
    }
  }

  openMap(address: string | undefined) {
    if (!address) return;
    console.log('Abrindo mapa para:', address);
  }

  contactSupport() {
    console.log('Contactando suporte...');
  }
}