import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { OrderService } from 'src/app/core/services/order.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OrdersComponent  implements OnInit {
selectedSegment: 'active' | 'history' = 'active';
  activeOrders: any[] = [];
  orderHistory: any[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private orderService: OrderService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando pedidos...'
    });
    await loading.present();
    this.isLoading = true;

    try {
      // Carregar todos os pedidos
      const response = await this.orderService.getOrders('all').toPromise();
      
      // Separar pedidos ativos e histórico
      if (response && response.data) {
        // Adaptar conforme a estrutura exata da resposta da sua API
        this.activeOrders = response.data.filter((order: any) => 
          ['pending', 'confirmed', 'preparing', 'ready', 'delivering'].includes(order.status)
        );
        
        this.orderHistory = response.data.filter((order: any) => 
          ['delivered', 'cancelled'].includes(order.status)
        );
      }
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      this.errorMessage = 'Não foi possível carregar seus pedidos';
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  segmentChanged(event: any) {
    this.selectedSegment = event.detail.value;
  }

  viewOrderDetails(order: any) {
    this.router.navigate(['/consumer/orders/details', order.id]);
  }

  // Métodos auxiliares
  getStatusColor(status: string): string {
    const statusColors: {[key: string]: string} = {
      'pending': 'warning',
      'confirmed': 'primary',
      'preparing': 'primary',
      'ready': 'primary',
      'delivering': 'tertiary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    
    return statusColors[status] || 'medium';
  }

  getStatusLabel(status: string): string {
    const statusLabels: {[key: string]: string} = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'ready': 'Pronto',
      'delivering': 'Em entrega',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    
    return statusLabels[status] || status;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'MZN'
    });
  }

}
