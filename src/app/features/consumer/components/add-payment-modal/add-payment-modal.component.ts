import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PaymentService, PaymentMethodRequest } from '../../services/payment.service';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  cardOutline,
  cashOutline,
  phonePortraitOutline,
  personOutline,
  walletOutline,
  checkmarkOutline,
  addOutline,
  calendarOutline,
  lockClosedOutline
} from 'ionicons/icons';

// Registrar os ícones
addIcons({
  'close-outline': closeOutline,
  'card-outline': cardOutline,
  'cash-outline': cashOutline,
  'phone-portrait-outline': phonePortraitOutline,
  'person-outline': personOutline,
  'wallet-outline': walletOutline,
  'checkmark-outline': checkmarkOutline,
  'add-outline': addOutline,
  'calendar-outline': calendarOutline,
  'lock-closed-outline': lockClosedOutline
});

@Component({
  selector: 'app-add-payment-modal',
  templateUrl: './add-payment-modal.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class AddPaymentModalComponent implements OnInit {
  paymentForm!: FormGroup; // Usando o operador ! para indicar inicialização definida
  isSubmitting = false;
  selectedType: string = 'mpesa';
  months = Array.from({ length: 12 }, (_, i) => i + 1);
  years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);
  cardBrands = [
    { value: 'visa', label: 'Visa' },
    { value: 'mastercard', label: 'MasterCard' },
    { value: 'amex', label: 'American Express' }
  ];

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private toastCtrl: ToastController
  ) {
    this.createForm();
  }

  // Validar número de cartão usando o algoritmo de Luhn
  validateCardNumber(cardNumber: string): boolean {
    if (!cardNumber) return false;

    // Remover espaços e traços
    cardNumber = cardNumber.replace(/\s+|-/g, '');

    // Verificar se contém apenas dígitos
    if (!/^\d+$/.test(cardNumber)) return false;

    // Algoritmo de Luhn
    let sum = 0;
    let doubleUp = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i));

      if (doubleUp) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      doubleUp = !doubleUp;
    }

    return sum % 10 === 0;
  }

  // Método para exibir mensagens de erro
  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color: 'danger'
    });
    toast.present();
  }

  ngOnInit() {
    this.onPaymentTypeChange();
  }

  createForm() {
    this.paymentForm = this.fb.group({
      type: ['mpesa', [Validators.required]],
      title: ['', [Validators.required]],
      is_default: [false],
      is_active: [true],
      details: this.fb.group({
        // Campos para M-PESA e E-MOLA
        account_name: [''],
        phone_number: [''],

        // Campos para cartão
        holder_name: [''],
        brand: ['visa'],
        card_number: ['', [
          Validators.required,
          Validators.pattern(/^\d{13,19}$/) // Aceita cartões com 13 a 19 dígitos
        ]],
        expiration_month: [null],
        expiration_year: [null],

        // Campos ocultos que serão preenchidos programaticamente
        last_four: [''],
        card_token: ['']
      })
    });
  }

  onPaymentTypeChange() {
    this.selectedType = this.paymentForm.get('type')?.value;
    this.paymentForm.get('title')?.setValue('');

    const detailsGroup = this.paymentForm.get('details') as FormGroup;

    // Resetar validadores para todos os campos
    Object.keys(detailsGroup.controls).forEach(key => {
      detailsGroup.get(key)?.clearValidators();
      detailsGroup.get(key)?.updateValueAndValidity();
    });

    // Aplicar validadores com base no tipo selecionado
    if (this.selectedType === 'mpesa' || this.selectedType === 'emola') {
      detailsGroup.get('account_name')?.setValidators([Validators.required]);
      detailsGroup.get('phone_number')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{9,12}$/)
      ]);

      // Limpar campos do cartão
      detailsGroup.get('holder_name')?.setValue('');
      detailsGroup.get('brand')?.setValue('visa');
      detailsGroup.get('card_number')?.setValue('');
      detailsGroup.get('last_four')?.setValue('');
      detailsGroup.get('expiration_month')?.setValue(null);
      detailsGroup.get('expiration_year')?.setValue(null);
      detailsGroup.get('card_token')?.setValue('');
    }
    else if (this.selectedType === 'card' || this.selectedType === 'bank_card') {
      detailsGroup.get('holder_name')?.setValidators([Validators.required]);
      detailsGroup.get('brand')?.setValidators([Validators.required]);
      detailsGroup.get('card_number')?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{13,19}$/)
      ]);
      detailsGroup.get('expiration_month')?.setValidators([Validators.required]);
      detailsGroup.get('expiration_year')?.setValidators([Validators.required]);

      // Limpar campos do mobile money
      detailsGroup.get('account_name')?.setValue('');
      detailsGroup.get('phone_number')?.setValue('');
    }

    // Atualizar validadores
    Object.keys(detailsGroup.controls).forEach(key => {
      detailsGroup.get(key)?.updateValueAndValidity();
    });
  }

  updateTitle() {
    const type = this.paymentForm.get('type')?.value;
    let title = '';
    const details = this.paymentForm.get('details')?.value;

    switch (type) {
      case 'mpesa':
        title = `M-PESA - ${details.account_name}`;
        break;
      case 'emola':
        title = `E-MOLA - ${details.account_name}`;
        break;
      case 'card':
      case 'bank_card':
        title = `Cartão - ${details.holder_name}`;
        break;
    }

    this.paymentForm.get('title')?.setValue(title);
  }

  onNameChange() {
    if (this.selectedType === 'mpesa' || this.selectedType === 'emola') {
      const accountName = this.paymentForm.get('details.account_name')?.value;
      if (accountName) {
        this.updateTitle();
      }
    } else if (this.selectedType === 'card' || this.selectedType === 'bank_card') {
      const holderName = this.paymentForm.get('details.holder_name')?.value;
      if (holderName) {
        this.updateTitle();
      }
    }
  }

  async savePayment() {
    if (this.paymentForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const formValue = this.paymentForm.value;
      const details = { ...formValue.details };

      // Para cartões, derivar last_four e card_token do número do cartão
      if (formValue.type === 'card' || formValue.type === 'bank_card') {
        if (details.card_number) {
          // Validar o número do cartão antes de prosseguir
          if (!this.validateCardNumber(details.card_number)) {
            this.isSubmitting = false;
            await this.showToast('Número de cartão inválido. Verifique e tente novamente.');
            return;
          }

          // Extrair os últimos 4 dígitos
          details.last_four = details.card_number.slice(-4);

          // Usar o número completo como token (em produção, este seria um token real da API de pagamento)
          details.card_token = details.card_number;

          // Remover o número do cartão antes de enviar para a API
          delete details.card_number;
        }
      }

      const paymentData: PaymentMethodRequest = {
        type: formValue.type,
        title: formValue.title,
        is_default: formValue.is_default,
        is_active: formValue.is_active,
        details: details
      };

      // Usando lastValueFrom para lidar com Observable (Angular 14+)
      // Ou você pode usar .toPromise() se ainda estiver disponível na sua versão
      const response = await this.paymentService.addPaymentMethod(paymentData).toPromise();
      if (response) {
        this.modalCtrl.dismiss({
          added: true,
          payment: response
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar método de pagamento:', error);
      await this.showToast('Erro ao adicionar método de pagamento. Tente novamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
