import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { DriverService } from '../../services/driver.service';
import { CurrentDelivery } from '../../services/driver.service';

@Component({
  selector: 'app-delivery-flow',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/driver/orders"></ion-back-button>
        </ion-buttons>
        <ion-title>Entrega #{{ trackingNumber }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Stepper -->
      <div class="stepper ion-padding">
        <div class="step" [class.active]="currentStep >= 1" [class.completed]="currentStep > 1">
          <div class="step-number">1</div>
          <div class="step-label">Aceitar</div>
        </div>
        <div class="step-line" [class.active]="currentStep >= 2"></div>
        <div class="step" [class.active]="currentStep >= 2" [class.completed]="currentStep > 2">
          <div class="step-number">2</div>
          <div class="step-label">Coletar</div>
        </div>
        <div class="step-line" [class.active]="currentStep >= 3"></div>
        <div class="step" [class.active]="currentStep >= 3" [class.completed]="currentStep > 3">
          <div class="step-number">3</div>
          <div class="step-label">Entregar</div>
        </div>
      </div>

      <!-- Order Details -->
      <ion-card *ngIf="currentDelivery">
        <ion-card-header>
          <ion-card-subtitle>Detalhes do Pedido</ion-card-subtitle>
          <ion-card-title>{{ currentDelivery.item.dish_name }} ({{ currentDelivery.item.quantity }}x)</ion-card-title>
        </ion-card-header>

        <ion-card-content>
          <ion-list lines="none">
            <ion-item>
              <ion-icon name="restaurant-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>Restaurante</h3>
                <p>{{ currentDelivery.restaurant.name }}</p>
                <p>{{ formatAddress(currentDelivery.restaurant) }}</p>
                <p *ngIf="currentDelivery.restaurant.phone">
                  <ion-icon name="call-outline"></ion-icon>
                  {{ currentDelivery.restaurant.phone }}
                </p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="person-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>Cliente</h3>
                <p>{{ currentDelivery.customer.name }}</p>
                <p>{{ formatAddress(currentDelivery.customer) }}</p>
                <p *ngIf="currentDelivery.customer.phone">
                  <ion-icon name="call-outline"></ion-icon>
                  {{ currentDelivery.customer.phone }}
                </p>
              </ion-label>
            </ion-item>

            <ion-item>
              <ion-icon name="cash-outline" slot="start"></ion-icon>
              <ion-label>
                <h3>Valor</h3>
                <p>{{ formatCurrency(currentDelivery.item.price) }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
        </ion-card-content>
      </ion-card>

      <!-- Action Buttons -->
      <div class="ion-padding">
        <!-- Accept Button -->
        <ion-button *ngIf="currentStep === 1" expand="block" (click)="acceptDelivery()">
          <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
          Aceitar Entrega
        </ion-button>

        <!-- Collect Button -->
        <ion-button *ngIf="currentStep === 2" expand="block" (click)="collectDelivery()">
          <ion-icon name="restaurant-outline" slot="start"></ion-icon>
          Confirmar Coleta
        </ion-button>

        <!-- Complete Button -->
        <ion-button *ngIf="currentStep === 3" expand="block" (click)="completeDelivery()">
          <ion-icon name="flag-outline" slot="start"></ion-icon>
          Confirmar Entrega
        </ion-button>

        <!-- Navigation Buttons -->
        <ion-button *ngIf="currentStep >= 2" expand="block" color="secondary" (click)="openMaps()">
          <ion-icon name="navigate-outline" slot="start"></ion-icon>
          {{ currentStep === 2 ? 'Navegar até Restaurante' : 'Navegar até Cliente' }}
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .stepper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 20px 0;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      flex: 1;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--ion-color-medium);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .step-label {
      font-size: 14px;
      color: var(--ion-color-medium);
    }

    .step-line {
      height: 2px;
      background: var(--ion-color-medium);
      flex: 1;
      margin: 0 8px;
      margin-bottom: 24px;
    }

    .step.active .step-number {
      background: var(--ion-color-primary);
    }

    .step.active .step-label {
      color: var(--ion-color-primary);
    }

    .step.completed .step-number {
      background: var(--ion-color-success);
    }

    .step-line.active {
      background: var(--ion-color-primary);
    }

    ion-card {
      margin: 16px;
    }

    ion-item {
      --padding-start: 0;
    }

    ion-icon {
      font-size: 24px;
      margin-right: 16px;
    }

    ion-button {
      margin-bottom: 16px;
    }

    h3 {
      font-weight: 600;
      margin-bottom: 4px;
    }

    p {
      margin: 0;
      color: var(--ion-color-medium);
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class DeliveryFlowComponent implements OnInit {
  currentDelivery?: CurrentDelivery;
  currentStep = 1;
  trackingNumber = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driverService: DriverService
  ) {}

  ngOnInit() {
    this.loadCurrentDelivery();
  }

  async loadCurrentDelivery() {
    try {
      const response = await this.driverService.getCurrentDelivery().toPromise();
      if (response?.delivery) {
        this.currentDelivery = response.delivery;
        this.trackingNumber = this.currentDelivery.tracking.tracking_number;
        this.updateCurrentStep();
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da entrega:', error);
    }
  }

  updateCurrentStep() {
    if (!this.currentDelivery) return;

    switch (this.currentDelivery.tracking.status) {
      case 'awaiting-collection':
        this.currentStep = 1;
        break;
      case 'accepted':
        this.currentStep = 2;
        break;
      case 'picked-up':
        this.currentStep = 3;
        break;
      case 'delivered':
        this.currentStep = 4;
        break;
    }
  }

  async acceptDelivery() {
    try {
      const response = await this.driverService.acceptDelivery(this.currentDelivery!.tracking.id).toPromise();
      if (response) {
        this.currentStep = 2;
        await this.loadCurrentDelivery();
      }
    } catch (error) {
      console.error('Erro ao aceitar entrega:', error);
    }
  }

  async collectDelivery() {
    try {
      const response = await this.driverService.collectDelivery(this.currentDelivery!.tracking.id).toPromise();
      if (response) {
        this.currentStep = 3;
        await this.loadCurrentDelivery();
      }
    } catch (error) {
      console.error('Erro ao coletar entrega:', error);
    }
  }

  async completeDelivery() {
    try {
      const response = await this.driverService.completeDelivery(this.currentDelivery!.tracking.id).toPromise();
      if (response) {
        this.currentStep = 4;
        await this.loadCurrentDelivery();
        // Redirecionar para a lista de pedidos após completar
        this.router.navigate(['/driver/orders']);
      }
    } catch (error) {
      console.error('Erro ao completar entrega:', error);
    }
  }

  openMaps() {
    if (!this.currentDelivery) return;

    const destination = this.currentStep === 2 
      ? `${this.currentDelivery.restaurant.lat},${this.currentDelivery.restaurant.lng}`
      : `${this.currentDelivery.customer.lat},${this.currentDelivery.customer.lng}`;
    
    if (!destination.includes('null')) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
    }
  }

  formatAddress(location: { address: string | null }): string {
    return location.address || 'Endereço não disponível';
  }

  formatCurrency(value: string): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    }).format(parseFloat(value));
  }
} 