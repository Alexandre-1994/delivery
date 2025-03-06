import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AddressService } from '../../services/address.service';

@Component({
  selector: 'app-add-address-modal',
  templateUrl: './add-address-modal.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class AddAddressModalComponent {
  addressForm: FormGroup;
  isSubmitting = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private addressService: AddressService
  ) {
    this.addressForm = this.fb.group({
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      city: ['', [Validators.required]],
      complement: [''],
      reference: [''],
      is_default: [false]
    });
  }

  async saveAddress() {
    if (this.addressForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    try {
      const response = await this.addressService.addAddress(this.addressForm.value).toPromise();
      if (response) {
        this.modalCtrl.dismiss({
          added: true,
          address: response.data
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
    } finally {
      this.isSubmitting = false;
    }
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
