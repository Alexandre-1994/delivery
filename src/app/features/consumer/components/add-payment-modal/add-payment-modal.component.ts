import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-add-payment-modal',
  templateUrl: './add-payment-modal.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class AddPaymentModalComponent {
  paymentForm: FormGroup;
  isSubmitting = false;
  paymentTypes = [
    { value: 'money', label: 'Dinheiro' },
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'emola', label: 'E-mola' }
  ];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      type: ['', [Validators.required]],
      number: [''],
      holder_name: [''],
      is_default: [false]
    });
  }

  async savePayment() {
    if (this.paymentForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await this.paymentService.addPaymentMethod(this.paymentForm.value).toPromise();
      if (response) {
        this.modalCtrl.dismiss({
          added: true,
          payment: response.data
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  onPaymentTypeChange() {
    const type = this.paymentForm.get('type')?.value;
    if (type === 'money') {
      this.paymentForm.get('number')?.clearValidators();
      this.paymentForm.get('holder_name')?.clearValidators();
    } else {
      this.paymentForm.get('number')?.setValidators([Validators.required]);
      this.paymentForm.get('holder_name')?.setValidators([Validators.required]);
    }
    this.paymentForm.get('number')?.updateValueAndValidity();
    this.paymentForm.get('holder_name')?.updateValueAndValidity();
  }
}
