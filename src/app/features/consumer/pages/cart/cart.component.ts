// src/app/features/consumer/pages/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ]
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  restaurant: {
    id: number;
    name: string;
    deliveryFee: number;
    minOrder: number;
  } | null = null;
  orderNotes: string = '';
  couponCode: string = '';
  discount: number = 0;
  
  private cartSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService, 
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getItems().subscribe(items => {
      this.cartItems = items;
      
      // Se tivermos itens, extrair informações do restaurante
      if (items.length > 0) {
        this.restaurant = {
          id: items[0].restaurantId,
          name: items[0].restaurantName,
          deliveryFee: 1500, // Valor fixo ou buscar da API
          minOrder: 3000 // Valor fixo ou buscar da API
        };
      } else {
        this.restaurant = null;
      }
    });
  }
  
  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // Getters para cálculos
  get subtotal(): number {
    return this.cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0);
  }

  get total(): number {
    return this.subtotal + (this.restaurant?.deliveryFee || 0) - this.discount;
  }

  // Métodos para manipulação de itens
  increaseQuantity(item: CartItem): void {
    this.cartService.updateItemQuantity(item.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateItemQuantity(item.id, item.quantity - 1);
    } else {
      this.removeItem(item);
    }
  }

  async removeItem(item: CartItem): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Remover item',
      message: `Deseja remover ${item.name} do carrinho?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            this.cartService.removeItem(item.id);
            this.toastCtrl.create({
              message: 'Item removido do carrinho',
              duration: 2000,
              position: 'bottom'
            }).then(toast => toast.present());
          }
        }
      ]
    });
    
    await alert.present();
  }

  async clearCart(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Limpar carrinho',
      message: 'Tem certeza que deseja remover todos os itens do carrinho?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpar',
          handler: () => {
            this.cartService.clearCart();
            this.toastCtrl.create({
              message: 'Carrinho esvaziado',
              duration: 2000,
              position: 'bottom'
            }).then(toast => toast.present());
          }
        }
      ]
    });
    
    await alert.present();
  }

  // Método para aplicar cupom
  async applyCoupon(): Promise<void> {
    if (!this.couponCode) return;

    const loading = await this.loadingCtrl.create({
      message: 'Verificando cupom...'
    });
    await loading.present();

    try {
      // Aqui você faria uma chamada API para verificar o cupom
      // Simulando para fins de exemplo
      setTimeout(() => {
        if (this.couponCode.toUpperCase() === 'DESC10') {
          this.discount = this.subtotal * 0.1; // 10% de desconto
          this.toastCtrl.create({
            message: 'Cupom aplicado com sucesso!',
            duration: 10,
            position: 'bottom',
            color: 'success'
          }).then(toast => toast.present());
        } else {
          this.discount = 0;
          this.toastCtrl.create({
            message: 'Cupom inválido',
            duration: 10,
            position: 'bottom',
            color: 'danger'
          }).then(toast => toast.present());
        }
        loading.dismiss();
      }, 10);
    } catch (error) {
      loading.dismiss();
      this.toastCtrl.create({
        message: 'Erro ao verificar cupom',
        duration: 10,
        position: 'bottom',
        color: 'danger'
      }).then(toast => toast.present()); 
    }
  }

  // Método para finalizar pedido
  // async checkout(): Promise<void> {
  //   // Validar pedido mínimo
  //   if (this.total < (this.restaurant?.minOrder || 0)) {
  //     const remaining = this.getRemainingForMinOrder();
  //     this.toastCtrl.create({
  //       message: `Pedido mínimo não atingido. Adicione mais ${this.formatCurrency(remaining)}`,
  //       duration: 3000,
  //       position: 'bottom',
  //       color: 'warning'
  //     }).then(toast => toast.present());
  //     return;
  //   }
  
  //   const loading = await this.loadingCtrl.create({
  //     message: 'Processando seu pedido...'
  //   });
  //   await loading.present();
  
  //   try {
  //     // Preparar dados do pedido no formato esperado pela API
  //     const orderData = this.orderService.prepareOrderData(
  //       this.cartItems,
  //       this.restaurant,
  //       this.subtotal,
  //       this.restaurant?.deliveryFee || 0,
  //       this.discount,
  //       this.total,
  //       this.orderNotes,
  //       this.couponCode
  //     );
  
  //     // Enviar pedido para a API
  //     const response = await this.orderService.createOrder(orderData).toPromise();
  
  //     // Limpar o carrinho após o pedido ser bem-sucedido
  //     this.cartService.clearCart();
  
  //     loading.dismiss();
  
  //     // Mostrar confirmação
  //     const alert = await this.alertCtrl.create({
  //       header: 'Pedido Realizado',
  //       message: 'Seu pedido foi enviado com sucesso!',
  //       buttons: [
  //         {
  //           text: 'OK',
  //           handler: () => {
  //             // Navegar para a página de pedidos ou detalhes do pedido
  //             this.router.navigate(['/consumer/orders']);
  //           }
  //         }
  //       ]
  //     });
  //     await alert.present();
  
  //   } catch (error) {
  //     loading.dismiss();
  //     console.error('Erro ao processar o pedido:', error);
  
  //     // Mostrar mensagem de erro
  //     const toast = await this.toastCtrl.create({
  //       message: 'Ocorreu um erro ao processar seu pedido. Tente novamente.',
  //       duration: 3000,
  //       position: 'bottom',
  //       color: 'danger'
  //     });
  //     await toast.present();
  //   }
  // }
  async checkout(): Promise<void> {
    // Navegar para a página de checkout em vez de processar o pedido diretamente
    this.router.navigate(['/consumer/checkout']);
  }
  // Validações
  isMinOrderMet(): boolean {
    return this.subtotal >= (this.restaurant?.minOrder || 0);
  }

  getRemainingForMinOrder(): number {
    return (this.restaurant?.minOrder || 0) - this.subtotal;
  }

  // Navegação
  continueShopping(): void {
    if (this.restaurant) {
      this.router.navigate(['/consumer/restaurant', this.restaurant.id]);
    } else {
      this.router.navigate(['/consumer/restaurants']);
    }
  }

  // Formatadores
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'MZN'
    });
  }

  // Helper para imagens
  getItemImageUrl(photoName: string | null): string {
    if (!photoName) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/storage/dishes/${photoName}`;
  }
}