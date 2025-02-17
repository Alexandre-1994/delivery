import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';


import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { RestaurantsComponent } from './pages/restaurants/restaurants.component';

import { ConsumerRoutingModule } from './consumer-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ConsumerRoutingModule,
    CommonModule,
    IonicModule,
    FormsModule,
   
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ConsumerModule { }
