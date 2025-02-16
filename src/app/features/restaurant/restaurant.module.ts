import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantsComponent } from '../consumer/pages/restaurants/restaurants.component';
import { RouterModule } from '@angular/router';


import { RestaurantRoutingModule } from './restaurant-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RestaurantRoutingModule,
    RouterModule
  ]
})
export class RestaurantModule { }
