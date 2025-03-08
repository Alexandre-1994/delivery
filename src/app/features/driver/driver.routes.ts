import { Routes } from '@angular/router';
import { DriverGuard } from '../../core/guards/driver.guard';

export const DRIVER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent),
    canActivate: [DriverGuard]
  },
  {
    path: 'delivery/:id',
    loadComponent: () => import('./pages/delivery-flow/delivery-flow.component').then(m => m.DeliveryFlowComponent),
    canActivate: [DriverGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [DriverGuard]
  }
]; 