// src/app/features/consumer/pages/cart/cart.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

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
    this.cartSubscription = this.cartService.getItems().subscribe(items => {
      this.cartItems = items;

      // Se tivermos itens, extrair informações do restaurante
      if (items.length > 0) {
        // Idealmente, buscar esses valores da API
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

  // Método para obter URL da imagem
  // getItemImageUrl(photo: string): string {
  //   return `${environment.apiUrl}/storage/${photo}`;
  // }
  getItemImageUrl(image: string): string {
    // if (!image) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/get-image/dishes/${image}`;
  }

  // Método para aplicar cupom
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
      // TODO: Implementar validação do cupom com a API
      // Por enquanto, apenas simular um desconto
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

  // Método para continuar comprando
  continueShopping() {
    this.router.navigate(['/consumer/restaurants']);
  }

  // Método para finalizar pedido
  async checkout() {
    // Primeiro verificar o pedido mínimo
    if (!this.isMinOrderMet()) {
      const toast = await this.toastCtrl.create({
        message: `Pedido mínimo é ${this.formatCurrency(this.restaurant?.minOrder || 0)}`,
        duration: 2000,
        position: 'bottom',
        color: 'warning'
      });
      toast.present();
      return;
    }

    // Verificar autenticação
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

    // Se estiver autenticado, prosseguir para o checkout
    this.router.navigate(['/consumer/checkout']);
  }

  // Validações
  isMinOrderMet(): boolean {
    return this.subtotal >= (this.restaurant?.minOrder || 0);
  }

  getRemainingForMinOrder(): number {
    return (this.restaurant?.minOrder || 0) - this.subtotal;
  }

  // Formatadores
  formatCurrency(value: number): string {
    return value.toLocaleString('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    });
  }
}
