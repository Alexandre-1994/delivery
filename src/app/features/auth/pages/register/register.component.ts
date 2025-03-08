import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/auth/login"></ion-back-button>
        </ion-buttons>
        <ion-title>
          <ion-text color="dark">Criar Conta</ion-text>
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <ion-list>
          <ion-item>
            <ion-label position="floating">Nome</ion-label>
            <ion-input type="text" formControlName="name"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('name')?.touched && registerForm.get('name')?.errors?.['required']">
            <p class="ion-padding-start">Nome é obrigatório</p>
          </ion-text>

          <ion-item>
            <ion-label position="floating">Email</ion-label>
            <ion-input type="email" formControlName="email"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['required']">
            <p class="ion-padding-start">Email é obrigatório</p>
          </ion-text>
          <ion-text color="danger" *ngIf="registerForm.get('email')?.touched && registerForm.get('email')?.errors?.['email']">
            <p class="ion-padding-start">Email inválido</p>
          </ion-text>

          <ion-item>
            <ion-label position="floating">Senha</ion-label>
            <ion-input type="password" formControlName="password"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['required']">
            <p class="ion-padding-start">Senha é obrigatória</p>
          </ion-text>
          <ion-text color="danger" *ngIf="registerForm.get('password')?.touched && registerForm.get('password')?.errors?.['minlength']">
            <p class="ion-padding-start">Senha deve ter no mínimo 6 caracteres</p>
          </ion-text>

          <ion-item>
            <ion-label position="floating">Confirmar Senha</ion-label>
            <ion-input type="password" formControlName="password_confirmation"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('password_confirmation')?.touched && registerForm.get('password_confirmation')?.errors?.['required']">
            <p class="ion-padding-start">Confirmação de senha é obrigatória</p>
          </ion-text>
          <ion-text color="danger" *ngIf="registerForm.errors?.['passwordMismatch']">
            <p class="ion-padding-start">As senhas não conferem</p>
          </ion-text>
        </ion-list>

        <div class="ion-padding">
          <ion-button expand="block" type="submit" [disabled]="registerForm.invalid || isLoading">
            <ion-spinner *ngIf="isLoading"></ion-spinner>
            <span *ngIf="!isLoading">Criar Conta</span>
          </ion-button>

          <ion-button expand="block" fill="clear" routerLink="/auth/login">
            Já tem uma conta? Faça login
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          // Após o registro bem-sucedido, fazer login automaticamente
          const credentials = {
            email: this.registerForm.get('email')?.value,
            password: this.registerForm.get('password')?.value
          };
          
          this.authService.login(credentials).subscribe({
            next: () => {
              this.router.navigate(['/consumer/restaurants']);
            },
            error: (error) => {
              console.error('Erro ao fazer login após registro:', error);
              // Redirecionar para login em caso de erro
              this.router.navigate(['/auth/login']);
            }
          });
        },
        error: (error) => {
          console.error('Erro no registro:', error);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
} 