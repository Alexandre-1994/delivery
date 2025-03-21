import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
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
        <ion-title>Criar Conta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <ion-list>
          <ion-item>
            <ion-label position="floating">Nome Completo</ion-label>
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
            <ion-label position="floating">Telefone</ion-label>
            <ion-input type="tel" formControlName="phone"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('phone')?.touched && registerForm.get('phone')?.errors?.['required']">
            <p class="ion-padding-start">Telefone é obrigatório</p>
          </ion-text>

          <ion-item>
            <ion-label position="floating">Província</ion-label>
            <ion-input type="text" formControlName="provincia"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('provincia')?.touched && registerForm.get('provincia')?.errors?.['required']">
            <p class="ion-padding-start">Província é obrigatória</p>
          </ion-text>

          <ion-item>
            <ion-label position="floating">Cidade</ion-label>
            <ion-input type="text" formControlName="city"></ion-input>
          </ion-item>
          <ion-text color="danger" *ngIf="registerForm.get('city')?.touched && registerForm.get('city')?.errors?.['required']">
            <p class="ion-padding-start">Cidade é obrigatória</p>
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
    private router: Router,
    private toastCtrl: ToastController
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      provincia: ['', [Validators.required]],
      city: ['', [Validators.required]],
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

  async onSubmit() {
    if (this.registerForm.valid && !this.isLoading) {
      this.isLoading = true;

      try {
        const formData = {
          name: this.registerForm.value.name,
          email: this.registerForm.value.email,
          phone: this.registerForm.value.phone,
          password: this.registerForm.value.password,
          provincia: this.registerForm.value.provincia,
          city: this.registerForm.value.city
        };

        await this.authService.register(formData).toPromise();
        
        const toast = await this.toastCtrl.create({
          message: 'Conta criada com sucesso! Por favor, faça login.',
          duration: 3000,
          position: 'bottom',
          color: 'success'
        });
        await toast.present();

        // Após criar conta, redireciona para login
        this.router.navigate(['/auth/login']);
      } catch (error: any) {
        console.error('Erro no registro:', error);
        
        const toast = await this.toastCtrl.create({
          message: error.message || 'Erro ao criar conta. Tente novamente.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        await toast.present();
      } finally {
        this.isLoading = false;
      }
    }
  }
}