import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController } from '@ionic/angular';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DriverService, CurrentDelivery } from '../../services/driver.service';

@Component({
  selector: 'app-delivery-detail',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/driver/orders"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ deliveryTitle }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Loading -->
      <div *ngIf="isLoading" class="ion-text-center">
        <ion-spinner></ion-spinner>
        <p>Carregando detalhes...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="ion-text-center">
        <ion-icon name="alert-circle-outline" color="danger" size="large"></ion-icon>
        <p>{{ error }}</p>
        <ion-button (click)="loadOrderDetails()">
          <ion-icon name="refresh-outline" slot="start"></ion-icon>
          Tentar Novamente
        </ion-button>
      </div>

      <!-- Order Details -->
      <ion-card *ngIf="order && !isLoading && !error">
        <ion-card-header>
          <ion-card-subtitle>Detalhes do Pedido</ion-card-subtitle>
          <ion-card-title>{{ order.item.dish_name }}</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-list lines="none">
            <!-- Restaurant Info -->
            <ion-item>
              <ion-icon name="restaurant-outline" slot="start"></ion-icon>
              <ion-label>
                <h2>Restaurante</h2>
                <p>{{ order.restaurant.name }}</p>
                <p>{{ order.restaurant.address || 'Endereço não disponível' }}</p>
                <p *ngIf="order.restaurant.phone">
                  <ion-icon name="call-outline"></ion-icon>
                  {{ order.restaurant.phone }}
                </p>
              </ion-label>
            </ion-item>

            <!-- Customer Info -->
            <ion-item>
              <ion-icon name="person-outline" slot="start"></ion-icon>
              <ion-label>
                <h2>Cliente</h2>
                <p>{{ order.customer.name }}</p>
                <p>{{ order.customer.address || 'Endereço não disponível' }}</p>
                <p *ngIf="order.customer.phone">
                  <ion-icon name="call-outline"></ion-icon>
                  {{ order.customer.phone }}
                </p>
              </ion-label>
            </ion-item>

            <!-- Order Info -->
            <ion-item>
              <ion-icon name="information-circle-outline" slot="start"></ion-icon>
              <ion-label>
                <h2>Informações</h2>
                <p>Quantidade: {{ order.item.quantity }}x</p>
                <p>Valor: {{ formatCurrency(order.item.price) }}</p>
                <p>Status: {{ getStatusText(order.tracking.status) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Action Buttons -->
      <div *ngIf="order && !isLoading && !error" class="ion-padding">
        <!-- Navigation Button -->
        <ion-button expand="block" color="secondary" (click)="openMaps()">
          <ion-icon name="navigate-outline" slot="start"></ion-icon>
          {{ order.tracking.status === 'accepted' ? 'Navegar até Restaurante' : 'Navegar até Cliente' }}
        </ion-button>

        <!-- Status Buttons -->
        <ion-button *ngIf="order.tracking.status === 'accepted'" expand="block" (click)="confirmCollect()">
          <ion-icon name="restaurant-outline" slot="start"></ion-icon>
          Confirmar Coleta
        </ion-button>

        <ion-button *ngIf="order.tracking.status === 'picked-up'" expand="block" (click)="confirmDelivery()">
          <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
          Confirmar Entrega
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-card {
      margin: 0;
      margin-bottom: 16px;
    }

    ion-item {
      --padding-start: 0;
      margin-bottom: 16px;
    }

    ion-icon {
      font-size: 24px;
      margin-right: 16px;
    }

    h2 {
      font-weight: 600;
      margin-bottom: 8px;
    }

    p {
      margin: 4px 0;
      display: flex;
      align-items: center;
    }

    p ion-icon {
      font-size: 16px;
      margin-right: 8px;
    }

    ion-button {
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DeliveryDetailComponent implements OnInit {
  order?: CurrentDelivery;
  isLoading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadOrderDetails();
  }

  async loadOrderDetails() {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await this.driverService.getCurrentDelivery().toPromise();
      if (response?.delivery) {
        this.order = response.delivery;
      } else {
        this.error = 'Pedido não encontrado';
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do pedido:', error);
      this.error = 'Erro ao carregar detalhes do pedido';
    } finally {
      this.isLoading = false;
    }
  }

  async confirmCollect() {
    if (!this.order) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Coleta',
      message: 'Você está no restaurante e coletou o pedido?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim',
          handler: () => this.confirmCollectOrder()
        }
      ]
    });
    await alert.present();
  }

  async confirmCollectOrder() {
    if (!this.order) return;
    
    try {
      await this.driverService.collectDelivery(this.order.tracking.id).toPromise();
      this.showToast('Coleta confirmada com sucesso!', 'success');
      await this.loadOrderDetails();
    } catch (error) {
      console.error('Erro ao confirmar coleta:', error);
      this.showToast('Erro ao confirmar coleta. Tente novamente.', 'danger');
    }
  }

  async confirmDelivery() {
    if (!this.order) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Entrega',
      message: 'Você entregou o pedido ao cliente?',
      buttons: [
        {
          text: 'Não',
          role: 'cancel'
        },
        {
          text: 'Sim',
          handler: () => this.completeDelivery()
        }
      ]
    });
    await alert.present();
  }

  private async completeDelivery() {
    if (!this.order) return;

    try {
      const response = await this.driverService.completeDelivery(this.order.tracking.id).toPromise();
      if (response) {
        const toast = await this.toastCtrl.create({
          message: response.message || 'Entrega confirmada com sucesso!',
          duration: 3000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();
        this.router.navigate(['/driver/orders']);
      }
    } catch (error) {
      console.error('Erro ao confirmar entrega:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao confirmar entrega. Tente novamente.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    }
  }

  openMaps() {
    if (!this.order) return;

    const destination = this.order.tracking.status === 'accepted'
      ? `${this.order.restaurant.lat},${this.order.restaurant.lng}`
      : `${this.order.customer.lat},${this.order.customer.lng}`;

    if (!destination.includes('null')) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    } else {
      this.toastCtrl.create({
        message: 'Coordenadas não disponíveis para navegação',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      }).then(toast => toast.present());
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'awaiting-collection': 'Aguardando Coleta',
      'accepted': 'Aceito',
      'picked-up': 'Coletado',
      'delivering': 'Em Entrega',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  formatCurrency(value: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    }).format(parseFloat(value));
  }

  get deliveryTitle(): string {
    return this.order?.tracking?.tracking_number 
      ? `Entrega #${this.order.tracking.tracking_number}`
      : 'Detalhes da Entrega';
  }

  private showToast(message: string, color: string) {
    this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    }).then(toast => toast.present());
  }
} 