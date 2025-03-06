// src/app/features/auth/pages/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, LoadingController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const loading = await this.loadingCtrl.create({
      message: 'Entrando...'
    });
    await loading.present();

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        loading.dismiss();
        this.router.navigate(['/consumer/restaurants']);
      },
      error: async (err) => {
        loading.dismiss();
        console.error('Erro ao fazer login:', err);
        
        const toast = await this.toastCtrl.create({
          message: 'Email ou senha incorretos. Tente novamente.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
        
        this.isSubmitting = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/auth/register']);
  }
}