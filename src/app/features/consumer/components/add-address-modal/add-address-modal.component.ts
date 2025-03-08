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
      address_name: ['', [Validators.required]],
      recipient_name: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      province: ['', [Validators.required]],
      city: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      street: ['', [Validators.required]],
      block: ['', [Validators.required]],
      reference: [''],
      addressLat: [''],
      addressLng: [''],
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
          address: response
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
