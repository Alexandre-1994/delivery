import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'consumer',
    loadComponent: () => import('./features/consumer/consumer-tabs/consumer-tabs.component').then(m => m.ConsumerTabsComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'restaurants',
        pathMatch: 'full'
      },
      {
        path: 'restaurants',
        loadComponent: () => import('./features/consumer/pages/restaurants/restaurants.component').then(m => m.RestaurantsComponent)
      },
      {
        path: 'restaurant/:id',
        loadComponent: () => import('./features/consumer/pages/restaurant-detail/restaurant-detail.component').then(m => m.RestaurantDetailComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/consumer/pages/orders/orders.component').then(m => m.OrdersComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/consumer/pages/cart/cart.component').then(m => m.CartComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/consumer/pages/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },

  // Delivery routes
  {
    path: 'delivery',
    canActivate: [AuthGuard],
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
  },

  // Redirects
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];