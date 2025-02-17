import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Restaurant {
  id: number;
  name: string;
  image: string;
  deliveryTime: number;
  deliveryFee: number;
  minOrder: number;
}

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
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  restaurant: Restaurant | null = null;
  orderNotes: string = '';
  couponCode: string = '';
  discount: number = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    // Carregar dados de exemplo
    this.loadMockData();
  }

  loadMockData() {
    this.restaurant = {
      id: 1,
      name: 'Restaurante Tradicional',
      image: 'https://placehold.co/60x60',
      deliveryTime: 30,
      deliveryFee: 1500,
      minOrder: 3000
    };

    this.cartItems = [
      {
        id: 1,
        name: 'Mufete Tradicional',
        price: 5000,
        quantity: 1
      },
      {
        id: 2,
        name: 'Sumo de Múcua',
        price: 1500,
        quantity: 2,
        notes: 'Bem gelado, por favor'
      }
    ];
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
    item.quantity++;
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      item.quantity--;
    } else {
      this.removeItem(item);
    }
  }

  removeItem(item: CartItem): void {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
  }

  clearCart(): void {
    this.cartItems = [];
  }

  // Método para aplicar cupom
  async applyCoupon(): Promise<void> {
    if (!this.couponCode) return;

    // Simular validação de cupom
    if (this.couponCode.toUpperCase() === 'DESC10') {
      this.discount = this.subtotal * 0.1; // 10% de desconto
      // Mostrar mensagem de sucesso
    } else {
      this.discount = 0;
      // Mostrar mensagem de erro
    }
  }

  // Método para finalizar pedido
  async checkout(): Promise<void> {
    // Validar pedido mínimo
    if (this.total < (this.restaurant?.minOrder || 0)) {
      // Mostrar alerta de pedido mínimo
      console.log('Pedido mínimo não atingido');
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

    console.log('Finalizando pedido:', order);
    // Navegar para página de checkout
    this.router.navigate(['/consumer/checkout'], { state: { order } });
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
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'MZN'
    });
  }
}