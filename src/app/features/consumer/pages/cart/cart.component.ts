import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem, RestaurantGroup } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  removeCircleOutline,
  trashOutline,
  createOutline,
  ticketOutline,
  alertCircleOutline,
  cartOutline,
  restaurantOutline
} from 'ionicons/icons';

// Register icons
addIcons({
  'add-circle-outline': addCircleOutline,
  'remove-circle-outline': removeCircleOutline,
  'trash-outline': trashOutline,
  'create-outline': createOutline,
  'ticket-outline': ticketOutline,
  'alert-circle-outline': alertCircleOutline,
  'cart-outline': cartOutline,
  'restaurant-outline': restaurantOutline
});

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
  restaurantGroups: RestaurantGroup[] = [];
  orderNotes: string = '';
  couponCode: string = '';
  discount: number = 0;
  isLoading: boolean = false;

  private cartSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private cartService: CartService,
    private orderService: OrderService,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cartSubscription = this.cartService.getRestaurantGroups().subscribe(groups => {
      this.restaurantGroups = groups;
    });
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // Getters for calculations
get subtotal(): number {
  if (!this.restaurantGroups || this.restaurantGroups.length === 0) {
    return 0;
  }

  return this.restaurantGroups.reduce((total, group) => {
    if (!group || !group.items || !Array.isArray(group.items)) {
      return total;
    }
    return total + group.items.reduce((groupTotal, item) => {
      if (!item) return groupTotal;
      return groupTotal + (item.price * item.quantity);
    }, 0);
  }, 0);
}

get deliveryFeeTotal(): number {
  if (!this.restaurantGroups || this.restaurantGroups.length === 0) {
    return 0;
  }

  return this.restaurantGroups.reduce((total, group) => {
    if (!group) return total;
    return total + (group.deliveryFee || 0);
  }, 0);
}

calculateRestaurantSubtotal(group: RestaurantGroup): number {
  if (!group || !group.items || !Array.isArray(group.items)) {
    return 0;
  }

  return group.items.reduce((total, item) => {
    if (!item) return total;
    return total + (item.price * item.quantity);
  }, 0);
}

get total(): number {
  return this.subtotal + this.deliveryFeeTotal - this.discount;
}

  // Item manipulation methods
  increaseQuantity(restaurantId: number, item: CartItem): void {
    this.cartService.updateItemQuantity(restaurantId, item.id, item.quantity + 1);
  }

  decreaseQuantity(restaurantId: number, item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateItemQuantity(restaurantId, item.id, item.quantity - 1);
    } else {
      this.removeItem(restaurantId, item);
    }
  }

  async removeItem(restaurantId: number, item: CartItem): Promise<void> {
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
            this.cartService.removeItem(restaurantId, item.id);
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

  async clearRestaurantItems(restaurantId: number, restaurantName: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Limpar itens',
      message: `Deseja remover todos os itens de ${restaurantName}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Limpar',
          handler: () => {
            this.cartService.clearRestaurantItems(restaurantId);
            this.toastCtrl.create({
              message: `Itens de ${restaurantName} removidos`,
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

  getItemImageUrl(image: string): string {
    if (!image) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/get-image/dishes/${image}`;
  }

  async applyCoupon() {
    if (!this.couponCode) {
      const toast = await this.toastCtrl.create({
        message: 'Digite um cupom válido',
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Validando cupom...'
    });
    await loading.present();

    try {
      // TODO: Implement coupon validation with API
      // For now, just simulate a discount
      this.discount = 500; // 5 reais de desconto

      const toast = await this.toastCtrl.create({
        message: 'Cupom aplicado com sucesso!',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
      toast.present();
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      const toast = await this.toastCtrl.create({
        message: 'Erro ao aplicar cupom. Tente novamente.',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
      toast.present();
    } finally {
      loading.dismiss();
    }
  }

  continueShopping() {
    this.router.navigate(['/consumer/restaurants']);
  }

  async checkout() {
    // Check if any restaurant fails to meet minimum order
    const failedRestaurants = this.restaurantGroups.filter(group =>
      !this.isMinOrderMet(group));

    if (failedRestaurants.length > 0) {
      const message = failedRestaurants.map(group =>
        `${group.restaurantName}: faltam ${this.formatCurrency(group.minOrder - this.calculateRestaurantSubtotal(group))}`
      ).join('\n');

      const toast = await this.toastCtrl.create({
        message: `Pedido mínimo não atingido:\n${message}`,
        duration: 3000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    // Check authentication
    if (!this.authService.isAuthenticated) {
      const alert = await this.alertCtrl.create({
        header: 'Autenticação necessária',
        message: 'Você precisa fazer login para continuar',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Fazer Login',
            handler: () => {
              this.authService.setReturnUrl('/consumer/checkout');
              this.router.navigate(['/auth/login']);
            }
          }
        ]
      });
      await alert.present();
      return;
    }

    // Informar o usuário que serão gerados pedidos separados para cada restaurante
    if (this.restaurantGroups.length > 1) {
      const alert = await this.alertCtrl.create({
        header: 'Múltiplos Restaurantes',
        message: `Você está fazendo pedidos de ${this.restaurantGroups.length} restaurantes diferentes. Será criado um pedido separado para cada restaurante.`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Continuar',
            handler: () => {
              // Proceed to checkout
              this.router.navigate(['/consumer/checkout']);
            }
          }
        ]
      });
      await alert.present();
    } else {
      // Proceed to checkout with single restaurant
      this.router.navigate(['/consumer/checkout']);
    }
  }

  isMinOrderMet(group: RestaurantGroup): boolean {
    return this.calculateRestaurantSubtotal(group) >= (group.minOrder || 0);
  }

  getRemainingForMinOrder(group: RestaurantGroup): number {
    return Math.max(0, (group.minOrder || 0) - this.calculateRestaurantSubtotal(group));
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    });
  }

  get hasItems(): boolean {
    return this.restaurantGroups.length > 0;
  }
}
