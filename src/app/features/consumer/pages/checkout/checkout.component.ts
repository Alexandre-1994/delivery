// src/app/features/consumer/pages/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AddressService, Address } from '../../services/address.service';
import { PaymentService, PaymentMethod } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { AddAddressModalComponent } from '../../components/add-address-modal/add-address-modal.component';
import { AddPaymentModalComponent } from '../../components/add-payment-modal/add-payment-modal.component';
import { addIcons } from 'ionicons';
import {
  addOutline,
  cardOutline,
  cashOutline,
  chevronForwardOutline,
  locationOutline,
  walletOutline,
  arrowBackOutline,
  closeOutline,
  checkmarkOutline,
  qrCodeOutline
} from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth.service';
// import { GeolocationService } from '../../services/geolocation.service'; // Import the geolocation service

import { TrackingService } from 'src/app/services/tracking.service'; // Import the tracking service

// Registrar os ícones
addIcons({
  'add-outline': addOutline,
  'card-outline': cardOutline,
  'cash-outline': cashOutline,
  'chevron-forward-outline': chevronForwardOutline,
  'location-outline': locationOutline,
  'wallet-outline': walletOutline,
  'arrow-back-outline': arrowBackOutline,
  'close-outline': closeOutline,
  'checkmark-outline': checkmarkOutline,
  'qr-code-outline': qrCodeOutline
});

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  restaurant: any = null;
  orderNotes: string = '';
  
  // Endereços e métodos de pagamento
  addresses: Address[] = [];
  paymentMethods: PaymentMethod[] = [];
  
  // Seleções do usuário
  selectedAddressId: number | null = null;
  selectedPaymentMethodId: number | null = null;
  
  // Flags de carregamento
  isLoading = true;
  isAddressesLoading = false;
  isPaymentsLoading = false;

  // Order summary
  baseDeliveryFee: number = 0;
  discount: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService,
    private addressService: AddressService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,

    private trackingService: TrackingService // Inject the tracking service
  ) {}

  async ngOnInit() {
    // Verificar autenticação primeiro
    if (!this.authService.isAuthenticated) {
      this.authService.setReturnUrl('/consumer/checkout');
      this.router.navigate(['/auth/login']);
      return;
    }

    // Carregar dados do carrinho
    this.cartService.getItems().subscribe(items => {
      this.cartItems = items;
      
      if (items.length > 0) {
        this.restaurant = {
          id: items[0].restaurantId,
          name: items[0].restaurantName,
          deliveryFee: 0 // Valor fixo ou buscar da API
        };
      } else {
        // Se não tiver itens no carrinho, voltar para a lista de restaurantes
        this.router.navigate(['/consumer/restaurants']);
      }
    });
    
    // Carregar endereços e métodos de pagamento
    await this.loadAddresses();
    await this.loadPaymentMethods();
    
    this.isLoading = false;
  }
  
  async loadAddresses() {
    this.isAddressesLoading = true;
    
    try {
      const addresses = await this.addressService.getAddresses().toPromise();
      if (addresses) {
        this.addresses = addresses;
        
        // Selecionar o endereço padrão, se existir
        const defaultAddress = this.addresses.find(addr => addr.is_default === 1);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
        } else if (this.addresses.length > 0) {
          this.selectedAddressId = this.addresses[0].id;
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar endereços:', error);
      
      if (error.status === 401) {
        // Se for erro de autenticação, redirecionar para login
        this.authService.setReturnUrl('/consumer/checkout');
        this.router.navigate(['/auth/login']);
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Não foi possível carregar seus endereços. Tente novamente.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
      }
    } finally {
      this.isAddressesLoading = false;
    }
  }
  
  async loadPaymentMethods() {
    this.isPaymentsLoading = true;
    
    try {
      const response = await this.paymentService.getPaymentMethods().toPromise();
      if (response) {
        this.paymentMethods = response;
        
        // Selecionar o método de pagamento padrão, se existir
        const defaultPayment = this.paymentMethods.find(payment => payment.is_default);
        if (defaultPayment) {
          this.selectedPaymentMethodId = defaultPayment.id;
        } else if (this.paymentMethods.length > 0) {
          this.selectedPaymentMethodId = this.paymentMethods[0].id;
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      
      if (error.status === 401) {
        // Se for erro de autenticação, redirecionar para login
        this.authService.setReturnUrl('/consumer/checkout');
        this.router.navigate(['/auth/login']);
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Não foi possível carregar seus métodos de pagamento. Tente novamente.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
      }
    } finally {
      this.isPaymentsLoading = false;
    }
  }

  async showAddAddressModal() {
    const modal = await this.modalCtrl.create({
      component: AddAddressModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.added) {
      await this.loadAddresses();
    }
  }

  async showAddPaymentModal() {
    const modal = await this.modalCtrl.create({
      component: AddPaymentModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.added) {
      await this.loadPaymentMethods();
    }
  }

  loadOrderSummary() {
    // Implementar lógica para carregar resumo do pedido
  }

  canConfirmOrder(): boolean {
    return this.selectedAddressId !== null && 
           this.selectedPaymentMethodId !== null;
  }

  async confirmOrder() {
    if (!this.canConfirmOrder()) {
      const toast = await this.toastCtrl.create({
        message: 'Selecione um endereço e um método de pagamento',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    if (!this.selectedAddressId || !this.selectedPaymentMethodId) {
      const toast = await this.toastCtrl.create({
        message: 'Endereço e método de pagamento são obrigatórios',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Processando seu pedido...'
    });
    await loading.present();

    try {
      // Preparar dados do pedido usando o serviço
      const orderData = this.orderService.prepareOrderData(
        this.cartItems,
        this.selectedAddressId,
        this.selectedPaymentMethodId,
        this.total
      );
      
      // Enviar pedido para a API
      const response = await this.orderService.createOrder(orderData).toPromise();
      
      // Limpar carrinho
      this.cartService.clearCart();
      
      // Mostrar mensagem de sucesso
      const toast = await this.toastCtrl.create({
        message: 'Pedido realizado com sucesso!',
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });
      toast.present();
      
      // Redirecionar para a página de pedidos
      this.router.navigate(['/consumer/orders']);
    } catch (error: any) {
      console.error('Erro ao confirmar pedido:', error);
      
      // Verificar se é erro de autenticação
      if (error.status === 401) {
        const toast = await this.toastCtrl.create({
          message: 'Sua sessão expirou. Por favor, faça login novamente.',
          duration: 3000,
          position: 'bottom',
          color: 'warning'
        });
        toast.present();
        
        // Salvar URL atual e redirecionar para login
        this.authService.setReturnUrl('/consumer/checkout');
        this.router.navigate(['/auth/login']);
      } else {
        const toast = await this.toastCtrl.create({
          message: 'Não foi possível processar seu pedido. Tente novamente.',
          duration: 3000,
          position: 'bottom',
          color: 'danger'
        });
        toast.present();
      }
    } finally {
      await loading.dismiss();
    }
  }
  
  // Cálculos
  get subtotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  }

  get deliveryFee(): number {
    if (!this.restaurant || !this.selectedAddressId) {
      return 0;
    }

    const restaurantLocation = this.trackingService.getRestaurantLocation(this.restaurant.id);
    const customerAddress = this.addresses.find(addr => addr.id === this.selectedAddressId);
    if (!customerAddress) {
      return 0;
    }

    const customerLocation = {
      lat: customerAddress.latitude,
      lng: customerAddress.longitude
    };

    // const distance = this.geolocationService.calculateDistance(restaurantLocation, customerLocation);
    // return this.geolocationService.calculateDeliveryFee(distance);
    return 0; // Temporary return until geolocation service is implemented
  }

  get total(): number {
    return this.subtotal + this.deliveryFee;
  }
  
  // Navegação
  goToAddNewAddress() {
    this.router.navigate(['/consumer/profile/address/add']);
  }
  
  goToAddNewPaymentMethod() {
    this.router.navigate(['/consumer/profile/payment/add']);
  }
  
  // Finalizar Pedido
  async placeOrder() {
    if (!this.selectedAddressId) {
      const toast = await this.toastCtrl.create({
        message: 'Selecione um endereço de entrega',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }
    
    if (!this.selectedPaymentMethodId) {
      const toast = await this.toastCtrl.create({
        message: 'Selecione um método de pagamento',
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }
    
    await this.confirmOrder();
  }
  
  async showToast(message: string, color = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'bottom',
      color
    });
    toast.present();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      // minimumFractionDigits: 2,
      // maximumFractionDigits: 2
    }).format(value);
  }

  getPaymentMethodIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'credit_card':
        return 'card-outline';
      case 'debit_card':
        return 'card-outline';
      case 'pix':
        return 'qr-code-outline';
      case 'cash':
        return 'cash-outline';
      default:
        return 'card-outline';
    }
  }

  // Método para formatar o endereço para exibição
  formatAddress(address: Address): string {
    return `${address.street}, ${address.block} - ${address.neighborhood}, ${address.city}, ${address.province}, ${address.country}`;
  }
}