
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  restaurantId: number;
  restaurantName: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private items: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private restaurantIdSubject = new BehaviorSubject<number | null>(null);

  constructor() {
    // Carregar carrinho do localStorage se existir
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.items = JSON.parse(savedCart);
      this.cartItemsSubject.next(this.items);

      // Se temos itens, definir o restaurante atual
      if (this.items.length > 0) {
        this.restaurantIdSubject.next(this.items[0].restaurantId);
      }
    }
  }

  getItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  getCurrentRestaurantId(): Observable<number | null> {
    return this.restaurantIdSubject.asObservable();
  }

  getItemCount(): Observable<number> {
    return new Observable<number>(observer => {
      this.getItems().subscribe(items => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        observer.next(count);
      });
    });
  }

  getTotalPrice(): number {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  addItem(item: CartItem): boolean {
    // Verificar se já temos itens de outro restaurante
    if (this.items.length > 0 && this.items[0].restaurantId !== item.restaurantId) {
      // Não permitir misturar itens de restaurantes diferentes
      return false;
    }

    const existingItemIndex = this.items.findIndex(i => i.id === item.id);

    if (existingItemIndex > -1) {
      // Atualizar a quantidade se o item já existe
      this.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Adicionar novo item
      this.items.push(item);
    }

    // Salvar restaurante atual
    this.restaurantIdSubject.next(item.restaurantId);

    // Atualizar o subject e localStorage
    this.updateCart();
    return true;
  }

  updateItemQuantity(itemId: number, quantity: number): void {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index !== -1) {
      if (quantity <= 0) {
        // Remover o item se a quantidade for 0 ou menos
        this.removeItem(itemId);
      } else {
        this.items[index].quantity = quantity;
        this.updateCart();
      }
    }
  }

  removeItem(itemId: number): void {
    this.items = this.items.filter(item => item.id !== itemId);

    // Se removermos o último item, resetar o restaurante atual
    if (this.items.length === 0) {
      this.restaurantIdSubject.next(null);
    }

    this.updateCart();
  }

  clearCart(): void {
    this.items = [];
    this.restaurantIdSubject.next(null);
    this.updateCart();
  }

  private updateCart(): void {
    this.cartItemsSubject.next([...this.items]);
    localStorage.setItem('cart', JSON.stringify(this.items));
  }
}
