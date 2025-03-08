import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-driver-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="orders">
          <ion-icon name="bicycle-outline"></ion-icon>
          <ion-label>Pedidos</ion-label>
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
export class DriverTabsComponent {} 