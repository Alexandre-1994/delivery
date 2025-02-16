import { Routes } from '@angular/router';
import { RestaurantRoutingModule } from './features/restaurant/restaurant-routing.module';

import { RestaurantDetailComponent } from './features/consumer/pages/restaurant-detail/restaurant-detail.component';

export const routes: Routes = [

  { path: 'restaurant/:id', component: RestaurantDetailComponent },

  { 
    path: '', 
    redirectTo: 'consumer/restaurants', 
    pathMatch: 'full' // Define 'restaurants' como inicial
  },
  { 
    path: 'consumer/restaurants', 
    loadComponent: () => import('src/app/features/consumer/pages/restaurants/restaurants.component').then(m => m.RestaurantsComponent)

  },
  { 
    path: 'home', 
    loadComponent: () => import('./home/home.page').then(m => m.HomePage) 
  }
];
