export interface Order {
  id: string;
  consumerId: string;
  restaurantId: string;
  deliveryId?: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  rating?: OrderRating;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export interface OrderRating {
  restaurantRating: number;
  deliveryRating: number;
  comments?: string;
}

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash' | 'pix';
