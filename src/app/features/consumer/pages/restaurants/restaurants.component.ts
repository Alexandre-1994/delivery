import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink,],
  
})
export class RestaurantsComponent  implements OnInit {
  searchTerm: string = '';
  restaurants = [
    {
      id: 1,
      name: 'Restaurante Típico',
      cuisine: 'Comida Angolana',
      rating: 4.5,
      deliveryTime: 30,
      image: 'assets/images/restaurant1.jpg'
    },
    {
      id: 2,
      name: 'Pizza Express',
      cuisine: 'Pizzaria',
      rating: 4.7,
      deliveryTime: 45,
      image: 'assets/images/restaurant2.jpg'
    },
    {
      id: 3,
      name: 'Burguer House',
      cuisine: 'Hamburguer',
      rating: 4.3,
      deliveryTime: 25,
      image: 'assets/images/restaurant3.jpg'
    },
    {
      id: 4,
      name: 'Sushi Japan',
      cuisine: 'Japonesa',
      rating: 4.8,
      deliveryTime: 50,
      image: 'assets/images/restaurant4.jpg'
    }
  ];

  filteredRestaurants = [...this.restaurants];

  filterRestaurants() {
    if (!this.searchTerm) {
      this.filteredRestaurants = [...this.restaurants];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRestaurants = this.restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(term) || 
      restaurant.cuisine.toLowerCase().includes(term)
    );
  }

  constructor() { }

  ngOnInit() {}

}
