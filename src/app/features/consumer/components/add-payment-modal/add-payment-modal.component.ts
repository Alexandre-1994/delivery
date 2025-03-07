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
  selectedType: 'mpesa' | 'card' | 'emola' = 'mpesa';

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.paymentForm = this.fb.group({
      type: ['mpesa', [Validators.required]],
      title: ['', [Validators.required]],
      is_default: [false],
      is_active: [true],
      details: this.fb.group({
        account_name: ['', [Validators.required]],
        phone_number: ['', [Validators.required]]
      })
    });
  }

  async savePayment() {
    if (this.paymentForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.paymentForm.value;
      const paymentData = {
        type: formValue.type,
        title: formValue.title,
        is_default: formValue.is_default,
        is_active: formValue.is_active,
        details: formValue.details
      };

      const response = await this.paymentService.addPaymentMethod(paymentData).toPromise();
      if (response) {
        this.modalCtrl.dismiss({
          added: true,
          payment: response
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
    this.selectedType = this.paymentForm.get('type')?.value;
    this.paymentForm.get('title')?.setValue('');
    
    // Atualizar o título baseado no tipo selecionado
    const accountName = this.paymentForm.get('details.account_name')?.value;
    if (accountName) {
      this.updateTitle(accountName);
    }
  }

  updateTitle(accountName: string) {
    const type = this.paymentForm.get('type')?.value;
    let title = '';
    
    switch (type) {
      case 'mpesa':
        title = `M-PESA - ${accountName}`;
        break;
      case 'emola':
        title = `E-MOLA - ${accountName}`;
        break;
      case 'card':
        title = `Cartão - ${accountName}`;
        break;
    }
    
    this.paymentForm.get('title')?.setValue(title);
  }

  onAccountNameChange() {
    const accountName = this.paymentForm.get('details.account_name')?.value;
    if (accountName) {
      this.updateTitle(accountName);
    }
  }
}
