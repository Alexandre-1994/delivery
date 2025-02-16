#!/bin/bash

# Entrar no diretório do projeto
cd entrega

# Instalar dependências adicionais se ainda não tiver
npm install @angular/material @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools

# Criar estrutura de diretórios
mkdir -p src/app/{core/{auth,guards,services},shared/{components,pipes,models},features/{consumer,restaurant,delivery,admin}/{pages,components,services}} src/assets/{i18n,images}

# Criar arquivos de interfaces
cat > src/app/shared/models/user.interface.ts << 'EOL'
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'consumer' | 'restaurant' | 'delivery' | 'admin';
  address?: Address;
}
EOL

cat > src/app/shared/models/address.interface.ts << 'EOL'
export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
EOL

cat > src/app/shared/models/order.interface.ts << 'EOL'
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
EOL

# Criar módulos principais
ionic generate module features/consumer --routing
ionic generate module features/restaurant --routing
ionic generate module features/delivery --routing
ionic generate module features/admin --routing

# Criar componentes principais para cada módulo
# Consumidor
ionic generate component features/consumer/pages/profile
ionic generate component features/consumer/pages/restaurants
ionic generate component features/consumer/pages/restaurant-detail
ionic generate component features/consumer/pages/cart
ionic generate component features/consumer/pages/orders

# Restaurante
ionic generate component features/restaurant/pages/dashboard
ionic generate component features/restaurant/pages/menu
ionic generate component features/restaurant/pages/orders
ionic generate component features/restaurant/pages/profile

# Entregador
ionic generate component features/delivery/pages/available-orders
ionic generate component features/delivery/pages/current-delivery
ionic generate component features/delivery/pages/delivery-history
ionic generate component features/delivery/pages/profile

# Admin
ionic generate component features/admin/pages/dashboard
ionic generate component features/admin/pages/users
ionic generate component features/admin/pages/restaurants
ionic generate component features/admin/pages/orders

# Criar serviços principais
ionic generate service core/services/auth
ionic generate service core/services/order
ionic generate service core/services/user
ionic generate service core/services/notification

# Criar guards
ionic generate guard core/guards/auth
ionic generate guard core/guards/role

echo "Estrutura do projeto atualizada com sucesso!"
echo "Execute 'ionic serve' para verificar se está tudo funcionando corretamente."