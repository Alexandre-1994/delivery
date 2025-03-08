import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-driver-profile',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/driver/orders"></ion-back-button>
        </ion-buttons>
        <ion-title>Meu Perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="profile-header ion-text-center">
        <ion-avatar class="profile-avatar">
          <img src="assets/icons/driver-avatar.svg" alt="Avatar">
        </ion-avatar>
        <h2>{{ userName }}</h2>
        <p>Entregador</p>
      </div>

      <ion-list>
        <ion-item button detail (click)="goToMyOrders()">
          <ion-icon name="bicycle-outline" slot="start"></ion-icon>
          <ion-label>Meus Pedidos</ion-label>
        </ion-item>

        <ion-item button detail (click)="goToEarnings()">
          <ion-icon name="cash-outline" slot="start"></ion-icon>
          <ion-label>Ganhos</ion-label>
        </ion-item>

        <ion-item button detail (click)="goToSettings()">
          <ion-icon name="settings-outline" slot="start"></ion-icon>
          <ion-label>Configurações</ion-label>
        </ion-item>

        <ion-item button detail (click)="goToHelp()">
          <ion-icon name="help-circle-outline" slot="start"></ion-icon>
          <ion-label>Ajuda</ion-label>
        </ion-item>
      </ion-list>

      <div class="ion-padding">
        <ion-button expand="block" color="danger" (click)="logout()">
          <ion-icon name="log-out-outline" slot="start"></ion-icon>
          Sair
        </ion-button>
      </div>
    </ion-content>
  `,
  styles: [`
    .profile-header {
      margin: 32px 0;
    }

    .profile-avatar {
      width: 120px;
      height: 120px;
      margin: 0 auto 16px;
    }

    .profile-header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .profile-header p {
      margin: 8px 0 0;
      color: var(--ion-color-medium);
    }

    ion-item {
      --padding-start: 16px;
      --padding-end: 16px;
      --padding-top: 12px;
      --padding-bottom: 12px;
      margin-bottom: 8px;
    }

    ion-item ion-icon {
      font-size: 24px;
    }
  `],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProfileComponent {
  userName: string;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.userName = this.authService.getUserName();
  }

  goToMyOrders() {
    this.router.navigate(['/driver/orders']);
  }

  goToEarnings() {
    // Implementar navegação para tela de ganhos
  }

  goToSettings() {
    // Implementar navegação para tela de configurações
  }

  goToHelp() {
    // Implementar navegação para tela de ajuda
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
} 