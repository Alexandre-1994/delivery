import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

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

        <ion-tab-button tab="profile">
          <ion-icon name="person-outline"></ion-icon>
          <ion-label>Perfil</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  `,
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class ConsumerTabsComponent {} 