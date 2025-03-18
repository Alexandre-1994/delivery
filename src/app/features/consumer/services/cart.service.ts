import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

export interface RestaurantGroup {
  restaurantId: number;
  restaurantName: string;
  items: CartItem[];
  deliveryFee: number;
  minOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private restaurantGroups: RestaurantGroup[] = [];
  private cartGroupsSubject = new BehaviorSubject<RestaurantGroup[]>([]);

  constructor() {
    // Load cart from localStorage if it exists
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        // Try to parse as new format (restaurant groups)
        this.restaurantGroups = JSON.parse(savedCart);
        this.cartGroupsSubject.next(this.restaurantGroups);
      } catch (e) {
        try {
          // If that fails, try loading as old format (flat items array)
          const oldItems: CartItem[] = JSON.parse(savedCart);

          // Convert old format to new format
          if (oldItems.length > 0) {
            // Group by restaurantId
            const groupedItems: { [key: number]: CartItem[] } = {};

            oldItems.forEach(item => {
              if (!groupedItems[item.restaurantId]) {
                groupedItems[item.restaurantId] = [];
              }
              groupedItems[item.restaurantId].push(item);
            });

            // Create restaurant groups
            this.restaurantGroups = Object.keys(groupedItems).map(restaurantIdStr => {
              const restaurantId = Number(restaurantIdStr);
              const items = groupedItems[restaurantId];
              return {
                restaurantId,
                restaurantName: items[0].restaurantName,
                items,
                deliveryFee: 0, // Default value
                minOrder: 0     // Default value
              };
            });

            this.cartGroupsSubject.next(this.restaurantGroups);
            this.saveToStorage();
          }
        } catch (innerError) {
          console.error('Error parsing saved cart:', innerError);
          this.restaurantGroups = [];
          this.cartGroupsSubject.next([]);
        }
      }
    }
  }

  private saveToStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.restaurantGroups));
  }

  // Get all restaurant groups
  getRestaurantGroups(): Observable<RestaurantGroup[]> {
    return this.cartGroupsSubject.asObservable();
  }

// Get all items flattened (for backward compatibility)
getItems(): Observable<CartItem[]> {
  return this.cartGroupsSubject.pipe(
    map(groups => {
      let allItems: CartItem[] = [];
      groups.forEach(group => {
        allItems = allItems.concat(group.items);
      });
      return allItems;
    })
  );
}

  // Get current restaurant IDs
  getRestaurantIds(): Observable<number[]> {
    return this.cartGroupsSubject.pipe(
      map(groups => groups.map(group => group.restaurantId))
    );
  }

  // Check if cart has any items
  hasItems(): Observable<boolean> {
    return this.cartGroupsSubject.pipe(
      map(groups => groups.length > 0 && groups.some(group => group.items.length > 0))
    );
  }

  // Get total item count
  getItemCount(): Observable<number> {
    return this.cartGroupsSubject.pipe(
      map(groups =>
        groups.reduce((total, group) =>
          total + group.items.reduce((groupTotal, item) => groupTotal + item.quantity, 0), 0)
      )
    );
  }

  // Get total price
  getTotalPrice(): number {
    return this.restaurantGroups.reduce((total, group) =>
      total + group.items.reduce((groupTotal, item) =>
        groupTotal + (item.price * item.quantity), 0), 0);
  }

  // Add item to cart
  addItem(item: CartItem): boolean {
    // Find if restaurant group exists
    let group = this.restaurantGroups.find(g => g.restaurantId === item.restaurantId);

    if (!group) {
      // Create new restaurant group
      group = {
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
        items: [],
        deliveryFee: 0, // Default value, update from API if needed
        minOrder: 0     // Default value, update from API if needed
      };
      this.restaurantGroups.push(group);
    }

    // Find if item already exists in group
    const existingItemIndex = group.items.findIndex(i => i.id === item.id);

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      group.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item to group
      group.items.push(item);
    }

    // Update the subject and localStorage
    this.updateCart();
    return true;
  }

  // Update item quantity
  updateItemQuantity(restaurantId: number, itemId: number, quantity: number): void {
    const groupIndex = this.restaurantGroups.findIndex(g => g.restaurantId === restaurantId);

    if (groupIndex !== -1) {
      const itemIndex = this.restaurantGroups[groupIndex].items.findIndex(item => item.id === itemId);

      if (itemIndex !== -1) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or less
          this.removeItem(restaurantId, itemId);
        } else {
          this.restaurantGroups[groupIndex].items[itemIndex].quantity = quantity;
          this.updateCart();
        }
      }
    }
  }

  // For backward compatibility
  updateItemQuantity_old(itemId: number, quantity: number): void {
    for (const group of this.restaurantGroups) {
      const itemIndex = group.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        if (quantity <= 0) {
          this.removeItem(group.restaurantId, itemId);
        } else {
          group.items[itemIndex].quantity = quantity;
          this.updateCart();
        }
        return;
      }
    }
  }

  // Remove item
  removeItem(restaurantId: number, itemId: number): void {
    const groupIndex = this.restaurantGroups.findIndex(g => g.restaurantId === restaurantId);

    if (groupIndex !== -1) {
      this.restaurantGroups[groupIndex].items =
        this.restaurantGroups[groupIndex].items.filter(item => item.id !== itemId);

      // If group has no items, remove it
      if (this.restaurantGroups[groupIndex].items.length === 0) {
        this.restaurantGroups.splice(groupIndex, 1);
      }

      this.updateCart();
    }
  }

  // For backward compatibility
  removeItem_old(itemId: number): void {
    for (const group of this.restaurantGroups) {
      const itemIndex = group.items.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        this.removeItem(group.restaurantId, itemId);
        return;
      }
    }
  }

  // Clear items from a specific restaurant
  clearRestaurantItems(restaurantId: number): void {
    this.restaurantGroups = this.restaurantGroups.filter(g => g.restaurantId !== restaurantId);
    this.updateCart();
  }

  // Clear entire cart
  clearCart(): void {
    this.restaurantGroups = [];
    this.updateCart();
  }

  // Check if cart has multiple restaurants
  hasMultipleRestaurants(): Observable<boolean> {
    return this.cartGroupsSubject.pipe(
      map(groups => groups.length > 1)
    );
  }

  // Update cart data
  private updateCart(): void {
    this.cartGroupsSubject.next([...this.restaurantGroups]);
    this.saveToStorage();
  }
}
