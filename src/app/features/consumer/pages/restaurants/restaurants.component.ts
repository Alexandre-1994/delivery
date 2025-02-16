import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
// import { TranslateService } from '@ngx-translate/core';

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  image: string;
  deliveryFee: number; // Adicione esta linha
}

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, RouterLink, ],
  
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
      image: 'assets/images/image.pn',
      deliveryFee: 5
    },
    {
      id: 2,
      name: 'Pizza Express',
      cuisine: 'Pizzaria',
      rating: 4.7,
      deliveryTime: 45,
      image: 'assets/images/image.pn',
      deliveryFee: 5
    },
    {
      id: 3,
      name: 'Burguer House',
      cuisine: 'Hamburguer',
      rating: 4.3,
      deliveryTime: 25,
      image: 'assets/images/image.pn',
      deliveryFee: 5
    },
    {
      id: 4,
      name: 'Sushi Japan',
      cuisine: 'Japonesa',
      rating: 4.8,
      deliveryTime: 50,
      image: 'assets/images/image.pn',
      deliveryFee: 5
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

  // constructor(private translate: TranslateService) {
  //   translate.setDefaultLang('pt');
  //  }
  //  changeLanguage(lang: string) {
  //   this.translate.use(lang);
  // }

  ngOnInit() {}

}
