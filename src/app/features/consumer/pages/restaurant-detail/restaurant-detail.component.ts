import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

// Interfaces
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  photo: string;  // Alinhado com a API (photo em vez de image)
  category_id: number;  // Alinhado com a API
  category_name?: string;  // Adicionado para compatibilidade
  available: boolean;
  popular?: boolean;
  spicy?: boolean;
}

interface MenuCategory {
  id: number;
  name: string;
  items: MenuItem[];
}

interface RestaurantDetail {
  id: number;
  name: string;
  description?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
  photo?: string;
  cover?: string;
  opening_time?: string;
  closing_time?: string;
  menu_items?: MenuItem[];
  dishes?: MenuItem[];  // Alternativa se a API usar "dishes"
}

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule, 
    FormsModule,
    CurrencyPipe
  ]
})
export class RestaurantDetailComponent implements OnInit, OnDestroy {
  // Propriedades do componente
  restaurant: RestaurantDetail | null = null;
  menuItems: MenuItem[] = [];
  menuCategories: MenuCategory[] = [];
  selectedCategory: string = 'all';
  cartItems: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadRestaurantDetails(Number(id));
    } else {
      this.errorMessage = 'ID do restaurante não encontrado';
    }
  }

  ngOnDestroy() {
    // Implementação vazia para cumprir a interface OnDestroy
  }

  async loadRestaurantDetails(id: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando restaurante...'
    });
    await loading.present();
    this.isLoading = true;

    try {
      // Usando firstValueFrom em vez de toPromise (obsoleto)
      const data = await firstValueFrom(this.restaurantService.getRestaurantDetails(id));
      this.restaurant = data;
      
      // Verificar se temos menu_items nas respostas
      if (data.menu_items && Array.isArray(data.menu_items)) {
        this.menuItems = data.menu_items;
        this.organizeMenuByCategories();
      } else if (data.dishes && Array.isArray(data.dishes)) {
        // Alternativa se a API usar "dishes" em vez de "menu_items"
        this.menuItems = data.dishes;
        this.organizeMenuByCategories();
      }
      
    } catch (error) {
      console.error('Erro ao carregar detalhes do restaurante:', error);
      this.errorMessage = 'Não foi possível carregar os detalhes deste restaurante';
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  organizeMenuByCategories() {
    // Se não temos itens do menu, não fazemos nada
    if (!this.menuItems || this.menuItems.length === 0) return;

    // Criar um mapa de categorias
    const categoriesMap = new Map<number, MenuCategory>();
    
    // Adicionar categoria "Todos"
    categoriesMap.set(0, {
      id: 0,
      name: 'Todos',
      items: []
    });

    // Organizar itens por categoria
    this.menuItems.forEach(item => {
      // Garantir que temos category_id
      const categoryId = item.category_id || 0;
      
      // Se a categoria não existe ainda, criar
      if (!categoriesMap.has(categoryId)) {
        categoriesMap.set(categoryId, {
          id: categoryId,
          name: item.category_name || `Categoria ${categoryId}`,
          items: []
        });
      }
      
      // Adicionar o item tanto na categoria específica quanto em "Todos"
      categoriesMap.get(categoryId)?.items.push(item);
      categoriesMap.get(0)?.items.push(item);
    });

    // Converter o mapa para array para exibição
    this.menuCategories = Array.from(categoriesMap.values());
  }

  filterByCategory(categoryId: number | string) {
    if (typeof categoryId === 'string') {
      this.selectedCategory = categoryId;
    } else {
      this.selectedCategory = categoryId.toString();
    }
  }

  getFilteredMenuItems(): MenuItem[] {
    if (this.selectedCategory === 'all') {
      return this.menuItems;
    }
    
    return this.menuItems.filter(item => {
      // Garantir que temos category_id e que é do tipo correto
      const itemCategoryId = item.category_id?.toString() || '0';
      return itemCategoryId === this.selectedCategory;
    });
  }

  addToCart(item: MenuItem) {
    // Aqui você implementaria a lógica de adicionar ao carrinho
    // usando um serviço de carrinho
    
    this.cartItems++;
    
    this.toastCtrl.create({
      message: `${item.name} adicionado ao carrinho`,
      duration: 2000,
      position: 'bottom'
    }).then(toast => toast.present());
  }

  // Método auxiliar para obter URL completa da imagem
  getImageUrl(photoName: string | null | undefined): string {
    if (!photoName) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/get-image/restaurant/${photoName}`;
  }

  getDishImageUrl(photoName: string | null | undefined): string {
    if (!photoName) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/get-image/restaurant/${photoName}`;
  }

  goToCart() {
    this.router.navigate(['/consumer/cart']);
  }

  goBack() {
    this.router.navigate(['/consumer/restaurants']);
  }
}