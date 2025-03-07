import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PaymentService, PaymentMethod } from '../../services/payment.service';

@Component({
  selector: 'app-payment-methods',
  templateUrl: './payment-methods.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PaymentMethodsComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
    this.loadPaymentMethods();
  }

  async loadPaymentMethods() {
    try {
      this.paymentMethods = await this.paymentService.getPaymentMethods().toPromise() || [];
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      this.error = 'Erro ao carregar métodos de pagamento';
    } finally {
      this.isLoading = false;
    }
  }

  async setDefaultPaymentMethod(id: number) {
    try {
      await this.paymentService.setDefaultPaymentMethod(id).toPromise();
      await this.loadPaymentMethods(); // Recarrega a lista para atualizar o status padrão
    } catch (error) {
      console.error('Erro ao definir método de pagamento padrão:', error);
    }
  }

  getPaymentMethodIcon(type: string): string {
    switch (type) {
      case 'mpesa':
        return 'phone-portrait-outline';
      case 'card':
        return 'card-outline';
      case 'emola':
        return 'wallet-outline';
      default:
        return 'cash-outline';
    }
  }

  getPaymentMethodDetails(method: PaymentMethod): string {
    switch (method.type) {
      case 'mpesa':
        return method.mpesa_details ? 
          `Telefone: ${method.mpesa_details.phone_number}` : 
          'Detalhes não disponíveis';
      case 'card':
        return 'Cartão de crédito/débito';
      case 'emola':
        return 'Emola';
      default:
        return 'Outro método';
    }
  }
} 