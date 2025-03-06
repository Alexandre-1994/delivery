// src/app/features/consumer/pages/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { AddressService, Address } from '../../services/address.service';
import { PaymentService, PaymentMethod } from '../../services/payment.service';
import { OrderService } from '../../services/order.service';
import { AddAddressModalComponent } from '../../components/add-address-modal/add-address-modal.component';
import { AddPaymentModalComponent } from '../../components/add-payment-modal/add-payment-modal.component';



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
  selectedAddressId: any | null = null;
  selectedPaymentMethodId: any| null = null;
  
  // Flags de carregamento
  isLoading = true;
  isAddressesLoading = false;
  isPaymentsLoading = false;

  // Order summary
  // subtotal: number = 0;
  deliveryFee: number = 0;
  discount: number = 0;
  loadingCtrl: any;
  alertCtrl: any;
  toastCtrl: any;
  // total: number = 0;

  constructor(
    private router: Router,
    private cartService: CartService,
    private addressService: AddressService,
    private paymentService: PaymentService,
    private orderService: OrderService,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    // Carregar dados do carrinho
    this.cartService.getItems().subscribe(items => {
      this.cartItems = items;
      
      if (items.length > 0) {
        this.restaurant = {
          id: items[0].restaurantId,
          name: items[0].restaurantName,
          deliveryFee: 1500 // Valor fixo ou buscar da API
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
      const response = await this.addressService.getAddresses().toPromise();
      if (response && response.data) {
        this.addresses = response.data;
        
        // Selecionar o endereço padrão, se existir
        const defaultAddress = this.addresses.find(addr => addr.is_default);
        if (defaultAddress) {
          this.selectedAddressId = defaultAddress.id;
        } else if (this.addresses.length > 0) {
          this.selectedAddressId = this.addresses[0].id;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      // Mostrar mensagem de erro
    } finally {
      this.isAddressesLoading = false;
    }
  }
  
  async loadPaymentMethods() {
    this.isPaymentsLoading = true;
    
    try {
      const response = await this.paymentService.getPaymentMethods().toPromise();
      if (response && response.data) {
        this.paymentMethods = response.data;
        
        // Selecionar o método de pagamento padrão, se existir
        const defaultPayment = this.paymentMethods.find(payment => payment.is_default);
        if (defaultPayment) {
          this.selectedPaymentMethodId = defaultPayment.id;
        } else if (this.paymentMethods.length > 0) {
          this.selectedPaymentMethodId = this.paymentMethods[0].id;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      // Mostrar mensagem de erro
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
      this.loadAddresses();
    }
  }

  async showAddPaymentModal() {
    const modal = await this.modalCtrl.create({
      component: AddPaymentModalComponent
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data && data.added) {
      this.loadPaymentMethods();
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
      return;
    }

    try {
      // Implementar lógica de confirmação do pedido
      await this.orderService.createOrder({
        restaurant_id: 0,
        items: [],
        subtotal: 0,
        delivery_fee: 0,
        discount: 0,
        total: 0
      }).toPromise();
      
      this.router.navigate(['/consumer/orders']);
    } catch (error) {
      console.error('Erro ao confirmar pedido:', error);
    }
  }
  
  // Cálculos
  get subtotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  }

  get total(): number {
    return this.subtotal + (this.restaurant?.deliveryFee || 0);
  }
  
  // Navegação
  goToAddNewAddress() {
    // Navegar para página de adicionar endereço
    this.router.navigate(['/consumer/profile/address/add']);
  }
  
  goToAddNewPaymentMethod() {
    // Navegar para página de adicionar método de pagamento
    this.router.navigate(['/consumer/profile/payment/add']);
  }
  
  // Finalizar Pedido
  async placeOrder() {
    if (!this.selectedAddressId) {
      this.showToast('Selecione um endereço de entrega');
      return;
    }
    
    if (!this.selectedPaymentMethodId) {
      this.showToast('Selecione um método de pagamento');
      return;
    }
    
    const loading = await this.loadingCtrl.create({
      message: 'Processando seu pedido...'
    });
    await loading.present();
    
    try {
      // Encontrar o método de pagamento selecionado
      const paymentMethod = this.paymentMethods.find(p => p.id === this.selectedPaymentMethodId);
      
      // Preparar dados do pedido
      const orderData = {
        restaurant_id: this.restaurant.id,
        items: this.cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          notes: item.notes || ''
        })),
        subtotal: this.subtotal,
        delivery_fee: this.restaurant.deliveryFee,
        total: this.total,
        notes: this.orderNotes || '',
        discount: 0,
        
        // Dados adicionais
        address_id: this.selectedAddressId,
        payment_method_id: this.selectedPaymentMethodId,
        payment_type: paymentMethod?.type || ''
      };
      
      // Enviar pedido para a API
      const response = await this.orderService.createOrder(orderData).toPromise();
      
      // Limpar o carrinho
      this.cartService.clearCart();
      
      loading.dismiss();
      
      // Mostrar confirmação
      const alert = await this.alertCtrl.create({
        header: 'Pedido Realizado',
        message: 'Seu pedido foi enviado com sucesso!',
        buttons: [
          {
            text: 'OK',
            handler: () => {
              // Navegar para a página de pedidos
              this.router.navigate(['/consumer/orders']);
            }
          }
        ]
      });
      await alert.present();
      
    } catch (error) {
      loading.dismiss();
      console.error('Erro ao processar o pedido:', error);
      
      this.showToast('Ocorreu um erro ao processar seu pedido. Tente novamente.');
    }
  }
  
  // Helpers
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
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'MZN'
    });
  }
  
  getPaymentMethodIcon(type: string): string {
    const icons: {[key: string]: string} = {
      'bank_card': 'card',
      'mpesa': 'cash',
      'emola': 'wallet'
    };
    
    return icons[type] || 'card';
  }
}