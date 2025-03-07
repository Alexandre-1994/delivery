// src/app/features/consumer/pages/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';

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
  async checkout(): Promise<void> {
    // Validar pedido mínimo
    if (this.total < (this.restaurant?.minOrder || 0)) {
      const remaining = this.getRemainingForMinOrder();
      this.toastCtrl.create({
        message: `Pedido mínimo não atingido. Adicione mais ${this.formatCurrency(remaining)}`,
        duration: 10,
        position: 'bottom',
        color: 'warning'
      }).then(toast => toast.present());
      return;
    }

    // Criar objeto do pedido
    const order = {
      restaurantId: this.restaurant?.id,
      items: this.cartItems,
      subtotal: this.subtotal,
      deliveryFee: this.restaurant?.deliveryFee,
      discount: this.discount,
      total: this.total,
      notes: this.orderNotes,
      couponCode: this.couponCode
    };

    // Enviar para a página de checkout
    this.router.navigate(['/consumer/checkout'], { state: { order } });
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
  getItemImageUrl(image: string | null): string {
    if (!image) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/get-image/dishes/${image}`;
  }
}
