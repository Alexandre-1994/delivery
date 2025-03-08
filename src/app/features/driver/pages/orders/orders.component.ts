import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { DriverService, CurrentDelivery, DeliveryOrder } from '../../services/driver.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-driver-orders',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Pedidos</ion-title>
        <ion-buttons slot="end">
          <ion-button routerLink="/driver/profile">
            <ion-icon name="person-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar>
        <ion-segment [(ngModel)]="selectedSegment" (ionChange)="segmentChanged()">
          <ion-segment-button value="available">
            <ion-label>Disponíveis</ion-label>
          </ion-segment-button>
          <ion-segment-button value="active">
            <ion-label>Em Andamento</ion-label>
          </ion-segment-button>
          <ion-segment-button value="completed">
            <ion-label>Histórico</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-refresher slot="fixed" (ionRefresh)="doRefresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <!-- Loading -->
      <div *ngIf="isLoading" class="ion-padding ion-text-center">
        <ion-spinner></ion-spinner>
        <p>Carregando pedidos...</p>
      </div>

      <!-- Error -->
      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" color="danger" size="large"></ion-icon>
        <p>{{ error }}</p>
        <ion-button (click)="loadOrders()">
          <ion-icon name="refresh-outline" slot="start"></ion-icon>
          Tentar Novamente
        </ion-button>
      </div>

      <!-- Available Orders List -->
      <ion-list *ngIf="!isLoading && !error && selectedSegment === 'available'">
        <ion-item-sliding *ngFor="let order of availableOrders">
          <ion-item button (click)="confirmAcceptOrder(order)">
            <ion-label>
              <h2>Pedido #{{ order.tracking.tracking_number }}</h2>
              <p>
                <ion-icon name="restaurant-outline"></ion-icon>
                {{ order.restaurant.name }}
              </p>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{ formatAddress(order.order.address) }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ formatCurrency(order.price) }}
              </p>
              <p>
                <ion-icon name="fast-food-outline"></ion-icon>
                {{ order.dish.name }} ({{ order.quantity }}x)
              </p>
            </ion-label>
            <ion-chip [color]="getStatusColor(order.tracking.status)" slot="end">
              {{ getStatusText(order.tracking.status) }}
            </ion-chip>
          </ion-item>
        </ion-item-sliding>

        <!-- Empty State for Available Orders -->
        <div *ngIf="availableOrders.length === 0" class="ion-padding ion-text-center">
          <ion-icon name="bicycle-outline" color="medium" size="large"></ion-icon>
          <p>Nenhum pedido disponível no momento</p>
        </div>
      </ion-list>

      <!-- Active Orders List -->
      <ion-list *ngIf="!isLoading && !error && selectedSegment === 'active'">
        <ion-item-sliding *ngFor="let delivery of activeOrders">
          <ion-item>
            <ion-label>
              <h2>Pedido #{{ delivery.tracking.tracking_number }}</h2>
              <!-- Restaurante -->
              <ion-card>
                <ion-card-header>
                  <ion-card-subtitle>
                    <ion-icon name="restaurant-outline"></ion-icon>
                    Restaurante
                  </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p><strong>{{ delivery.restaurant.name }}</strong></p>
                  <p>{{ delivery.restaurant.address }}</p>
                  <p *ngIf="delivery.restaurant.phone">
                    <ion-icon name="call-outline"></ion-icon>
                    {{ delivery.restaurant.phone }}
                  </p>
                  <ion-button *ngIf="delivery.restaurant.lat && delivery.restaurant.lng" 
                            fill="clear" size="small" 
                            (click)="openMaps(delivery.restaurant.lat, delivery.restaurant.lng)">
                    <ion-icon name="navigate-outline" slot="start"></ion-icon>
                    Navegar até Restaurante
                  </ion-button>
                </ion-card-content>
              </ion-card>

              <!-- Cliente -->
              <ion-card>
                <ion-card-header>
                  <ion-card-subtitle>
                    <ion-icon name="person-outline"></ion-icon>
                    Cliente
                  </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p><strong>{{ delivery.customer.name }}</strong></p>
                  <p>{{ delivery.customer.address }}</p>
                  <p *ngIf="delivery.customer.phone">
                    <ion-icon name="call-outline"></ion-icon>
                    {{ delivery.customer.phone }}
                  </p>
                  <ion-button *ngIf="delivery.customer.lat && delivery.customer.lng" 
                            fill="clear" size="small" 
                            (click)="openMaps(delivery.customer.lat, delivery.customer.lng)">
                    <ion-icon name="navigate-outline" slot="start"></ion-icon>
                    Navegar até Cliente
                  </ion-button>
                </ion-card-content>
              </ion-card>

              <!-- Detalhes do Pedido -->
              <ion-card>
                <ion-card-header>
                  <ion-card-subtitle>
                    <ion-icon name="fast-food-outline"></ion-icon>
                    Detalhes do Pedido
                  </ion-card-subtitle>
                </ion-card-header>
                <ion-card-content>
                  <p>{{ delivery.item.dish_name }} ({{ delivery.item.quantity }}x)</p>
                  <p>{{ formatCurrency(delivery.item.price) }}</p>
                  
                  <!-- Botões de Ação Principal -->
                  <div class="action-buttons">
                    <ion-button *ngIf="delivery.tracking.status === 'awaiting-collection'" 
                              expand="block"
                              color="warning"
                              (click)="confirmCollectOrder(delivery)">
                      <ion-icon name="restaurant-outline" slot="start"></ion-icon>
                      Confirmar Coleta no Restaurante
                    </ion-button>

                    <ion-button *ngIf="delivery.tracking.status === 'in-transit'" 
                              expand="block"
                              color="success"
                              (click)="confirmCompleteDelivery(delivery)">
                      <ion-icon name="flag-outline" slot="start"></ion-icon>
                      Confirmar Entrega ao Cliente
                    </ion-button>

                    <!-- Botão de Navegação -->
                    <ion-button *ngIf="delivery.tracking.status === 'in-transit' && delivery.customer.lat && delivery.customer.lng" 
                              expand="block"
                              color="secondary"
                              (click)="openMaps(delivery.customer.lat, delivery.customer.lng)">
                      <ion-icon name="navigate-outline" slot="start"></ion-icon>
                      Navegar até Cliente
                    </ion-button>
                  </div>
                </ion-card-content>
              </ion-card>
            </ion-label>
            <ion-chip [color]="getStatusColor(delivery.tracking.status)" slot="end">
              {{ getStatusText(delivery.tracking.status) }}
            </ion-chip>
          </ion-item>
        </ion-item-sliding>

        <!-- Empty State for Active Orders -->
        <div *ngIf="activeOrders.length === 0" class="ion-padding ion-text-center">
          <ion-icon name="bicycle-outline" color="medium" size="large"></ion-icon>
          <p>Você não tem entregas em andamento</p>
        </div>
      </ion-list>

      <!-- Completed Orders List -->
      <ion-list *ngIf="!isLoading && !error && selectedSegment === 'completed'">
        <ion-item-sliding *ngFor="let delivery of completedOrders">
          <ion-item>
            <ion-label>
              <h2>Pedido #{{ delivery.tracking.tracking_number }}</h2>
              <p>
                <ion-icon name="restaurant-outline"></ion-icon>
                {{ delivery.restaurant.name }}
              </p>
              <p>
                <ion-icon name="location-outline"></ion-icon>
                {{ delivery.restaurant.address || 'Endereço não disponível' }}
              </p>
              <p>
                <ion-icon name="cash-outline"></ion-icon>
                {{ formatCurrency(delivery.item.price) }}
              </p>
              <p>
                <ion-icon name="fast-food-outline"></ion-icon>
                {{ delivery.item.dish_name }} ({{ delivery.item.quantity }}x)
              </p>
              <p *ngIf="delivery.customer">
                <ion-icon name="person-outline"></ion-icon>
                {{ delivery.customer.name }}
              </p>
              <p>
                <ion-icon name="calendar-outline"></ion-icon>
                {{ formatDate(delivery.tracking.estimated_delivery_time) }}
              </p>
            </ion-label>
            <ion-chip color="success" slot="end">
              Entregue
            </ion-chip>
          </ion-item>
        </ion-item-sliding>

        <!-- Empty State for Completed Orders -->
        <div *ngIf="completedOrders.length === 0" class="ion-padding ion-text-center">
          <ion-icon name="checkmark-circle-outline" color="medium" size="large"></ion-icon>
          <p>Nenhuma entrega concluída</p>
        </div>
      </ion-list>
    </ion-content>
  `,
  styles: [`
    ion-segment {
      padding: 8px;
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
    }

    ion-label h2 {
      font-weight: 600;
      margin-bottom: 8px;
    }

    ion-label p {
      display: flex;
      align-items: center;
      margin: 4px 0;
    }

    ion-label ion-icon {
      margin-right: 8px;
      font-size: 16px;
      min-width: 16px;
    }

    ion-chip {
      margin: 0;
    }

    .ion-padding ion-icon[size="large"] {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .action-buttons {
      margin-top: 16px;
    }

    .action-buttons ion-button {
      margin: 8px 0;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class OrdersComponent implements OnInit {
  availableOrders: DeliveryOrder[] = [];
  activeOrders: CurrentDelivery[] = [];
  completedOrders: CurrentDelivery[] = [];
  selectedSegment = 'available';
  isLoading = false;
  error: string | null = null;

  constructor(
    private driverService: DriverService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    this.isLoading = true;
    this.error = null;

    try {
      if (this.selectedSegment === 'available') {
        const response = await this.driverService.getAvailableOrders().toPromise();
        this.availableOrders = response || [];
      } else {
        const response = await this.driverService.getCurrentDelivery().toPromise();
        if (response?.delivery) {
          // Se tiver uma entrega atual, verificar o status
          if (['awaiting-collection', 'accepted', 'picked-up', 'in-transit'].includes(response.delivery.tracking.status)) {
            this.activeOrders = [response.delivery];
            this.completedOrders = [];
          } else if (response.delivery.tracking.status === 'delivered') {
            this.activeOrders = [];
            this.completedOrders = [response.delivery];
          } else {
            this.activeOrders = [];
            this.completedOrders = [];
          }
        } else {
          this.activeOrders = [];
          this.completedOrders = [];
        }
      }
    } catch (error) {
      this.error = 'Erro ao carregar pedidos. Tente novamente.';
      console.error('Erro ao carregar pedidos:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async segmentChanged() {
    await this.loadOrders();
  }

  async doRefresh(event: any) {
    try {
      await this.loadOrders();
    } finally {
      event.target.complete();
    }
  }

  openOrderDetails(delivery: CurrentDelivery) {
    switch (delivery.tracking.status) {
      case 'awaiting-collection':
      case 'accepted':
        this.confirmCollectOrder(delivery);
        break;
      case 'picked-up':
        this.confirmCompleteDelivery(delivery);
        break;
    }
  }

  async confirmAcceptOrder(order: any) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Pedido',
      message: `Deseja aceitar o pedido #${order.tracking.tracking_number}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aceitar',
          handler: () => this.acceptOrder(order.id)
        }
      ]
    });
    await alert.present();
  }

  async acceptOrder(orderId: number) {
    try {
      await this.driverService.acceptDelivery(orderId).toPromise();
      this.showToast('Pedido aceito com sucesso!', 'success');
      this.loadOrders();
    } catch (error) {
      this.showToast('Erro ao aceitar o pedido. Tente novamente.', 'danger');
    }
  }

  async confirmCollectOrder(delivery: CurrentDelivery) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Coleta',
      message: `Confirma que coletou o pedido #${delivery.tracking.tracking_number} no restaurante?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => this.collectOrder(delivery.tracking.id)
        }
      ]
    });
    await alert.present();
  }

  async collectOrder(trackingId: number) {
    try {
      await this.driverService.collectDelivery(trackingId).toPromise();
      this.showToast('Coleta confirmada com sucesso!', 'success');
      this.loadOrders();
    } catch (error) {
      this.showToast('Erro ao confirmar a coleta. Tente novamente.', 'danger');
    }
  }

  async confirmCompleteDelivery(delivery: CurrentDelivery) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Entrega',
      message: `Confirma que entregou o pedido #${delivery.tracking.tracking_number} ao cliente?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => this.completeDelivery(delivery.tracking.id)
        }
      ]
    });
    await alert.present();
  }

  async completeDelivery(trackingId: number) {
    try {
      await this.driverService.completeDelivery(trackingId).toPromise();
      this.showToast('Entrega concluída com sucesso!', 'success');
      this.loadOrders();
    } catch (error) {
      this.showToast('Erro ao confirmar a entrega. Tente novamente.', 'danger');
    }
  }

  async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  formatAddress(address: any): string {
    if (!address) return '';
    return `${address.street}, ${address.neighborhood}, ${address.city}`;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'awaiting-collection':
        return 'tertiary';
      case 'accepted':
        return 'primary';
      case 'picked-up':
      case 'in-transit':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'awaiting-collection':
        return 'Aguardando Coleta';
      case 'accepted':
        return 'Aceito';
      case 'picked-up':
      case 'in-transit':
        return 'Em Trânsito';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status || 'Desconhecido';
    }
  }

  formatCurrency(value: string | number): string {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openMaps(lat: string | null, lng: string | null) {
    if (!lat || !lng) {
      this.showToast('Coordenadas não disponíveis para navegação', 'danger');
      return;
    }

    const destination = `${lat},${lng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  }
} 