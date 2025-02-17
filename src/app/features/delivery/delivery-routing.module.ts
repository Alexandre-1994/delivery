import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'available-orders',
    pathMatch: 'full'
  },
  {
    path: 'available-orders',
    loadComponent: () => import('./pages/available-orders/available-orders.component')
      .then(m => m.AvailableOrdersComponent)
  },
  {
    path: 'current-delivery',
    loadComponent: () => import('./pages/current-delivery/current-delivery.component')
      .then(m => m.CurrentDeliveryComponent)
  },
  {
    path: 'delivery-history',
    loadComponent: () => import('./pages/delivery-history/delivery-history.component')
      .then(m => m.DeliveryHistoryComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component')
      .then(m => m.ProfileComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeliveryRoutingModule { }
