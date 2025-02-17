import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


interface AvailableOrder {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  distance: number;
  estimatedTime: number;
  value: number;
  items: number;
}

@Component({
  selector: 'app-available-orders',
  templateUrl: './available-orders.component.html',
  styleUrls: ['./available-orders.component.scss'],
  standalone: true,
    imports: [
      CommonModule, 
      IonicModule, 
      FormsModule, 
      RouterModule,
    ],

})
export class AvailableOrdersComponent  implements OnInit {
  isOnline: boolean = false;
  availableOrders: AvailableOrder[] = [];

  constructor(private router: Router) { }

  ngOnInit() { this.loadMockOrders();}

  loadMockOrders() {
    this.availableOrders = [
      {
        id: '1',
        restaurantName: 'Restaurante Tradicional',
        restaurantAddress: 'Rua Principal, 123 - Centro',
        deliveryAddress: 'Avenida Central, 456 - Bairro Novo',
        distance: 3.5,
        estimatedTime: 25,
        value: 5000,
        items: 2
      },
      {
        id: '2',
        restaurantName: 'Pizza Express',
        restaurantAddress: 'Avenida 1, 789 - Centro',
        deliveryAddress: 'Rua 2, 321 - Jardim',
        distance: 2.8,
        estimatedTime: 20,
        value: 4500,
        items: 1
      }
    ];
  }

  toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
  }

  acceptOrder(order: AvailableOrder) {
    // Aqui você implementaria a lógica de aceitar o pedido
    console.log('Pedido aceito:', order);
    this.router.navigate(['/delivery/current-delivery'], { 
      state: { order } 
    });
  }

}
