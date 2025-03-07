// src/app/features/auth/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>
          <ion-text color="dark">Login</ion-text>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <ion-list>
          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input type="email" formControlName="email"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['required']">
            <p class="ion-padding-start">Email é obrigatório</p>
          </ion-text>
          <ion-text color="danger" *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.errors?.['email']">
            <p class="ion-padding-start">Email inválido</p>
          </ion-text>

          <ion-item>
            <ion-label position="floating">Senha</ion-label>
            <ion-input type="password" formControlName="password"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.errors?.['required']">
            <p class="ion-padding-start">Senha é obrigatória</p>
          </ion-text>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="loginForm.invalid || isLoading">
            <ion-spinner *ngIf="isLoading"></ion-spinner>
            <span *ngIf="!isLoading">Entrar</span>
          </ion-button>

          <ion-button expand="block" fill="clear" routerLink="/auth/register">
            Não tem uma conta? Cadastre-se
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --background: var(--ion-color-light);
    }
    
    ion-list {
      background: var(--ion-color-light);
      padding: 0;
    }

    ion-item {
      --background: var(--ion-color-light);
      margin-bottom: 16px;
    }

    ion-button {
      margin-top: 24px;
    }

    .error-message {
      color: var(--ion-color-danger);
      font-size: 14px;
      margin: 8px 0;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/consumer/restaurants']);
        },
        error: async (error) => {
          console.error('Erro no login:', error);
          this.isLoading = false;

          const toast = await this.toastCtrl.create({
            message: error.message || 'Erro ao fazer login. Tente novamente.',
            duration: 3000,
            position: 'bottom',
            color: 'danger'
          });
          toast.present();
        }
      });
    }
  }
}