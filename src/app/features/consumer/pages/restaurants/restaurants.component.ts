import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { register } from 'swiper/element/bundle';
import 'swiper/element/bundle';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

register(); 

// Interface mais completa para o restaurante
interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  image: string;
  isOpen?: boolean;
  minOrder?: number;
  categories?: string[];
}

// Interface para o Swiper Config
interface SwiperConfig {
  slidesPerView: number;
  spaceBetween: number;
  centeredSlides: boolean;
  loop: boolean;
  autoplay: {
    delay: number;
  };
}

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styleUrls: ['./restaurants.component.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    IonicModule, 
    FormsModule, 
    RouterModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RestaurantsComponent implements OnInit {
  searchTerm: string = '';
  cartItems: number = 0;
  selectedCategory: string = 'todos';
  
  // Tipagem forte para o swiperConfig
  swiperConfig: SwiperConfig = {
    slidesPerView: 1.1,
    spaceBetween: 10,
    centeredSlides: true,
    loop: true,
    autoplay: {
      delay: 3000
    }
  };

  // Array tipado com a interface Restaurant
  restaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Restaurante Tradicional',
      cuisine: 'Comida Mocambiquena',
      rating: 4.5,
      deliveryTime: 30,
      deliveryFee: 1500,
      image: 'https://picsum.photos/300/200?food  ',
      isOpen: true,
      minOrder: 3000,
      categories: ['tradicional', 'Mocambiquena']
    },
    {
      id: 2,
      name: 'Pizza Express',
      cuisine: 'Pizzaria',
      rating: 4.7,
      deliveryTime: 45,
      deliveryFee: 2000,
      image: 'https://picsum.photos/300/200  ',
      isOpen: true,
      minOrder: 4000,
      categories: ['pizza', 'italiana']
    },
    {
      id: 3,
      name: 'Burguer House',
      cuisine: 'Fast Food',
      rating: 4.3,
      deliveryTime: 25,
      deliveryFee: 1000,
      image: 'https://loremflickr.com/300/200/burguer',
      isOpen: true,
      minOrder: 2500,
      categories: ['fast-food', 'hamburger']
    },
    {
      id: 4,
      name: 'Sushi Japan',
      cuisine: 'Japonesa',
      rating: 4.8,
      deliveryTime: 50,
      deliveryFee: 2500,
      image: 'https://loremflickr.com/300/200/food ',
      isOpen: true,
      minOrder: 5000,
      categories: ['japonesa', 'sushi']
    }
  ];

  // Restaurantes filtrados
  filteredRestaurants: Restaurant[] = this.restaurants;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicializa os restaurantes filtrados
    this.filterRestaurants();
  }

  // Método de busca melhorado
  search(): void {
    this.filterRestaurants();
  }

  // Método para filtrar restaurantes
  filterRestaurants(): void {
    this.filteredRestaurants = this.restaurants.filter(restaurant => {
      const matchesSearch = !this.searchTerm || 
        restaurant.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        restaurant.cuisine.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesCategory = this.selectedCategory === 'todos' || 
        restaurant.categories?.includes(this.selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }

  // Método para alterar categoria
  categoryChanged(event: any): void {
    this.selectedCategory = event.detail.value;
    this.filterRestaurants();
  }

  // Métodos de navegação
  goToRestaurant(restaurant: Restaurant): void {
    this.router.navigate(['/consumer/restaurant', restaurant.id]);
  }

  goToCart(): void {
    this.router.navigate(['/consumer/cart']);
  }

  goToProfile(): void {
    this.router.navigate(['/consumer/profile']);
  }

  goToOrders(): void {
    this.router.navigate(['/consumer/orders']);
  }

  goToHome(): void {
    this.router.navigate(['/consumer/restaurants']);
  }
  goToDelivery(): void {
    this.router.navigate(['/delivery/available-orders']);
  }
}