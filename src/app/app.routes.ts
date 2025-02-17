import { Routes } from '@angular/router';
import { RestaurantDetailComponent } from './features/consumer/pages/restaurant-detail/restaurant-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'consumer/restaurants',
    pathMatch: 'full'
  },
  {
    path: 'consumer',
    children: [
      {
        path: 'restaurants',
        loadComponent: () => import('./features/consumer/pages/restaurants/restaurants.component')
          .then(m => m.RestaurantsComponent)
      },
      {
        path: 'restaurant/:id',
        loadComponent: () => import('./features/consumer/pages/restaurant-detail/restaurant-detail.component')
          .then(m => m.RestaurantDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/consumer/pages/cart/cart.component')
          .then(m => m.CartComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/consumer/pages/orders/orders.component')
          .then(m => m.OrdersComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/consumer/pages/profile/profile.component')
          .then(m => m.ProfileComponent)
      }
    ]
  },

  {
    path: 'delivery',
    children: [
      {
        path: '',
        redirectTo: 'available-orders',
        pathMatch: 'full'
      },
      {
        path: 'available-orders',
        loadComponent: () => import('./features/delivery/pages/available-orders/available-orders.component')
          .then(m => m.AvailableOrdersComponent)
      },
      {
        path: 'current-delivery',
        loadComponent: () => import('./features/delivery/pages/current-delivery/current-delivery.component')
          .then(m => m.CurrentDeliveryComponent)
      },
      {
        path: 'delivery-history',
        loadComponent: () => import('./features/delivery/pages/delivery-history/delivery-history.component')
          .then(m => m.DeliveryHistoryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/delivery/pages/profile/profile.component')
          .then(m => m.ProfileComponent)
      }
    ]
  }
];