import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { DriverService } from '../../driver/services/driver.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-consumer-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="restaurants">
          <ion-icon name="restaurant-outline"></ion-icon>
          <ion-label>Restaurantes</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="orders">
          <ion-icon name="receipt-outline"></ion-icon>
          <ion-label>Pedidos</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="cart">
          <ion-icon name="cart-outline"></ion-icon>
          <ion-label>Carrinho</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="delivery" *ngIf="isDriver">
          <ion-icon name="bicycle-outline"></ion-icon>
          <ion-label>Entregas</ion-label>
          <ion-badge color="danger" *ngIf="availableDeliveries > 0">{{ availableDeliveries }}</ion-badge>
        </ion-tab-button>

        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  styles: [`
    ion-tab-bar {
      --background: var(--ion-color-light);
      border-top: 1px solid var(--ion-color-light-shade);
    }

    ion-tab-button {
      --color: var(--ion-color-medium);
      --color-selected: var(--ion-color-primary);
    }

    ion-badge {
      --padding-start: 6px;
      --padding-end: 6px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ConsumerTabsComponent implements OnInit, OnDestroy {
  availableDeliveries = 0;
  private updateSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    if (this.isDriver) {
      this.loadAvailableDeliveries();
      // Atualizar a cada 30 segundos
      this.updateSubscription = interval(30000).subscribe(() => {
        this.loadAvailableDeliveries();
      });
    }
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  get isDriver(): boolean {
    return this.authService.isDriver();
  }

  private async loadAvailableDeliveries() {
    try {
      const orders = await this.driverService.getAvailableOrders().toPromise();
      this.availableDeliveries = orders ? orders.length : 0;
    } catch (error) {
      console.error('Erro ao carregar entregas disponíveis:', error);
    }
  }
} 