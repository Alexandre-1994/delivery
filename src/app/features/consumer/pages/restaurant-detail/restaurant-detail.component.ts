
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { CartService, CartItem } from '../../services/cart.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  photo: string;
  category_id: number;
  category_name?: string;
  quantity?: number;
}

interface MenuCategory {
  id: number;
  name: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RestaurantDetailComponent implements OnInit, OnDestroy {
  restaurant: any = null;
  menuItems: MenuItem[] = [];
  menuCategories: MenuCategory[] = [];
  selectedCategory: string = 'all';
  cartItems: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';
  
  // Controle do modal de detalhes
  selectedItem: MenuItem | null = null;
  itemQuantity: number = 1;
  showModal: boolean = false;

  // Subscriptions
  private cartSubscription: Subscription | null = null;
  private cartRestaurantSubscription: Subscription | null = null;
  private currentRestaurantId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private restaurantService: RestaurantService,
    private cartService: CartService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    // Inscrever-se para atualizações do carrinho
    this.cartSubscription = this.cartService.getItemCount().subscribe(count => {
      this.cartItems = count;
    });

    // Verificar se já temos itens de outro restaurante
    this.cartRestaurantSubscription = this.cartService.getCurrentRestaurantId().subscribe(restaurantId => {
      this.currentRestaurantId = restaurantId;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.loadRestaurantDetails(Number(id));
    } else {
      this.errorMessage = 'ID do restaurante não encontrado';
    }
  }

  ngOnDestroy() {
    // Limpar subscriptions
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.cartRestaurantSubscription) {
      this.cartRestaurantSubscription.unsubscribe();
    }
  }

  async loadRestaurantDetails(id: number) {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando restaurante...'
    });
    await loading.present();
    this.isLoading = true;

    try {
      const data = await this.restaurantService.getRestaurantDetails(id).toPromise();
      this.restaurant = data;
      
      // Verificar se temos menu_items ou dishes na resposta
      if (data.menu_items && Array.isArray(data.menu_items)) {
        this.menuItems = data.menu_items.map((item: any) => ({...item, quantity: 1}));
        this.organizeMenuByCategories();
      } else if (data.dishes && Array.isArray(data.dishes)) {
        // Alternativa se a API usar "dishes" em vez de "menu_items"
        this.menuItems = data.dishes.map((item: any) => ({...item, quantity: 1}));
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
      // Se a categoria não existe ainda, criar
      if (!categoriesMap.has(item.category_id)) {
        categoriesMap.set(item.category_id, {
          id: item.category_id,
          name: item.category_name || `Categoria ${item.category_id}`,
          items: []
        });
      }
      
      // Adicionar o item tanto na categoria específica quanto em "Todos"
      categoriesMap.get(item.category_id)?.items.push(item);
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
    
    return this.menuItems.filter(item => 
      item.category_id.toString() === this.selectedCategory
    );
  }

  // Abrir modal de detalhes do item
  openItemDetails(item: MenuItem) {
    this.selectedItem = {...item, quantity: 1};
    this.itemQuantity = 1;
    this.showModal = true;
  }

  // Fechar modal
  closeModal() {
    this.showModal = false;
    this.selectedItem = null;
  }

  // Aumentar quantidade no modal
  incrementQuantity() {
    if (this.itemQuantity < 10) { // Limite de 10 por pedido
      this.itemQuantity++;
    }
  }

  // Diminuir quantidade no modal
  decrementQuantity() {
    if (this.itemQuantity > 1) {
      this.itemQuantity--;
    }
  }

  // Adicionar ao carrinho pelo modal
  async addToCartFromModal() {
    if (this.selectedItem) {
      const quantity = this.itemQuantity;
      await this.addItemToCart(this.selectedItem, quantity);
      this.closeModal();
    }
  }

  // Adicionar ao carrinho direto da lista
  async addToCart(item: MenuItem) {
    await this.addItemToCart(item, 1);
  }
  
  // Método comum para adicionar ao carrinho
  async addItemToCart(item: MenuItem, quantity: number) {
    // Verificar se já existe um restaurante diferente no carrinho
    if (this.currentRestaurantId !== null && 
        this.currentRestaurantId !== this.restaurant.id) {
      // Perguntar se o usuário quer limpar o carrinho
      const alert = await this.alertCtrl.create({
        header: 'Limpar carrinho?',
        message: 'Seu carrinho contém itens de outro restaurante. Deseja limpar o carrinho e adicionar este item?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Limpar e Adicionar',
            handler: () => {
              this.cartService.clearCart();
              this.addToCartConfirmed(item, quantity);
            }
          }
        ]
      });
      await alert.present();
    } else {
      // Adicionar diretamente se não há conflito
      this.addToCartConfirmed(item, quantity);
    }
  }
  
  // Método final para adicionar ao carrinho após verificações
  private addToCartConfirmed(item: MenuItem, quantity: number) {
    const cartItem: CartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      photo: item.photo,
      restaurantId: this.restaurant.id,
      restaurantName: this.restaurant.name,
      notes: ''
    };
    
    this.cartService.addItem(cartItem);
    
    this.toastCtrl.create({
      message: `${quantity}x ${item.name} adicionado ao carrinho`,
      duration: 2000,
      position: 'bottom'
    }).then(toast => toast.present());
  }

  // Método auxiliar para obter URL completa da imagem
  getImageUrl(photoName: string | null): string {
    if (!photoName) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/storage/restaurants/${photoName}`;
  }

  getDishImageUrl(photoName: string | null): string {
    if (!photoName) return 'assets/placeholder-food.jpg';
    return `http://127.0.0.1:8000/storage/dishes/${photoName}`;
  }

  goToCart() {
    this.router.navigate(['/consumer/cart']);
  }

  goBack() {
    this.router.navigate(['/consumer/restaurants']);
  }
}