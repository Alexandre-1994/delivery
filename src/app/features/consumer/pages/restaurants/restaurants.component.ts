import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { RestaurantService, Restaurant, Category, Dish } from '../../services/restaurant.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  locationOutline,
  cartOutline,
  alertCircleOutline,
  searchOutline,
  home,
  receipt,
  person
} from 'ionicons/icons';
import { AuthService } from 'src/app/core/services/auth.service';

// Registrar os ícones
addIcons({
  'location-outline': locationOutline,
  'cart-outline': cartOutline,
  'alert-circle-outline': alertCircleOutline,
  'search-outline': searchOutline,
  'home': home,
  'receipt': receipt,
  'person': person
});

// Registrar o componente Swiper
// register();

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
    HttpClientModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RestaurantsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  // Variáveis de estado
  searchTerm: string = '';
  cartItems: number = 0;
  selectedCategory: string = 'all';
  userName: string = ''; // Add userName property
  // Add dishes property
  dishes: any[] = [];
  filteredDishes: any[] = []; // Add this property

  // Dados da API
  restaurants: Restaurant[] = [];
  categories: Category[] = [];
  topDishes: Dish[] = [];

  // Dados filtrados
  filteredRestaurants: Restaurant[] = [];

  // Estado do componente
  isLoading: boolean = true;
  errorMessage: string = '';

  // Configuração do slider (agora será definida no template com swiper-container)
  slideOpts = {
    slidesPerView: 2.5,
    spaceBetween: 10,
    freeMode: true
  };

  swiperConfig = {
    slidesPerView: 2.5,
    spaceBetween: 16,
    freeMode: true,
    navigation: true,
    pagination: { clickable: true },
    breakpoints: {
      320: {
        slidesPerView: 1.5,
        spaceBetween: 10
      },
      480: {
        slidesPerView: 2.5,
        spaceBetween: 16
      },
      768: {
        slidesPerView: 3.5,
        spaceBetween: 16
      },
      1024: {
        slidesPerView: 4.5,
        spaceBetween: 16
      }
    }
  };

  constructor(
    private restaurantService: RestaurantService,
    private loadingCtrl: LoadingController,
    private router: Router,
    private authService: AuthService
  ) {
    // Check authentication
    // if (!this.authService.isAuthenticated) {
    //   this.router.navigate(['/auth/login']);
    // }
  }

  ngOnInit() {
    this.loadHomeData();
    this.userName = this.authService.getUserName(); // Get the logged-in user's name
    this.checkCartItems();
    this.filteredDishes = this.dishes; // Initialize filtered dishes
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async checkCartItems() {
    // Replace with your actual cart service implementation
    this.cartItems = 0;
  }

  loadHomeData() {
    this.isLoading = true;
    this.errorMessage = '';

    this.restaurantService.getAllData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.restaurants = data.restaurants || [];
          this.categories = data.categories || [];
          this.topDishes = data.topDishes || [];
          this.dishes = data.dishes || [];

          // Initialize all filtered arrays with full data
          this.filteredRestaurants = [...this.restaurants];
          this.filteredDishes = [...this.dishes];

          // Set default category
          this.selectedCategory = 'all';
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Erro ao carregar dados:', err);
          this.errorMessage = 'Não foi possível carregar os dados. Tente novamente.';
          this.isLoading = false;
        }
      });
  }

  search() {
    if (!this.searchTerm) {
      this.filterByCategory(this.selectedCategory);
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredRestaurants = this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(term) ||
      restaurant.city?.toLowerCase().includes(term) ||
      restaurant.neighborhood?.toLowerCase().includes(term)
    );
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;

    if (category === 'all') {
      // Show all items when 'all' is selected
      this.filteredDishes = [...this.dishes];
      this.filteredRestaurants = [...this.restaurants];
      return;
    }

    const selectedCategory = this.categories.find(c => c.name === category);
    if (selectedCategory) {
      // Filter dishes by category
      this.filteredDishes = this.dishes.filter(dish =>
        dish.category_id === selectedCategory.id
      );

      // Filter restaurants by checking if they have dishes in the selected category
      this.filteredRestaurants = this.restaurants.filter(restaurant => {
        const restaurantDishes = this.dishes.filter(dish =>
          dish.restaurant_id === restaurant.id
        );
        return restaurantDishes.some(dish =>
          dish.category_id === selectedCategory.id
        );
      });
    }
  }

  // Método para obter cidades únicas dos restaurantes (usado no template)
  getUniqueCities(): string[] {
    // Filtra valores undefined e remove duplicados
    return [...new Set(
      this.restaurants
        .map(r => r.city)
        .filter(city => city !== undefined && city !== null && city !== '')
    )];
  }

  // Métodos de navegação
  goToRestaurant(restaurant: Restaurant) {
    this.router.navigate(['/consumer/restaurant', restaurant.id]);
  }

  goToDish(dish: Dish) {
    // Navegar para a página de detalhes do prato ou adicionar ao carrinho
    console.log('Selecionado prato:', dish);
  }

  goToCart() {
    this.router.navigate(['/consumer/cart']);
  }

  goToProfile() {
    this.router.navigate(['/consumer/profile']);
  }

  goToOrders() {
    this.router.navigate(['/consumer/orders']);
  }

  goToHome() {
    this.router.navigate(['/consumer/restaurants']);
  }

  goToDelivery() {
    this.router.navigate(['/delivery/available-orders']);
  }

  getImageUrl(photoName: string): string {
    if (!photoName) return 'assets/images/default-restaurant.jpg';
    return `http://127.0.0.1:8000/get-image/restaurant/${photoName}`;
  }

  getDishImageUrl(image: string): string {
    if (!image) return 'assets/images/default-dish.jpg';
    return `http://127.0.0.1:8000/get-image/dishes/${image}`;
  }

  refreshData(event: any) {
    this.restaurantService.clearCache();
    this.loadHomeData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  async logout() {
    const loading = await this.loadingCtrl.create({
      message: 'Saindo...',
      duration: 1000
    });
    await loading.present();

    try {
      this.authService.logout();
      await loading.dismiss();
      this.router.navigate(['/login']);
    } catch (error) {
      await loading.dismiss();
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Add or update viewRestaurantDetails method
  viewRestaurantDetails(restaurantId: number) {
    const restaurant = this.restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      this.router.navigate(['/consumer/restaurant', restaurantId]);
    }
  }
}
