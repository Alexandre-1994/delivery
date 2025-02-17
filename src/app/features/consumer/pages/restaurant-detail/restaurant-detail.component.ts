import { Component, OnInit, OnDestroy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Location } from '@angular/common'; 
import { ActivatedRoute } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Interfaces
interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  popular?: boolean;
  spicy?: boolean;
}

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  image: string;
  minOrder: number;
  isOpen: boolean;
  categories: string[];
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
  restaurant: Restaurant | null = null;
  selectedCategory: string = 'main';
  cartItems: number = 0;
  filteredMenuItems: MenuItem[] = [];
  private routeSub: Subscription | null = null;

  // Categorias do menu
  categories = [
    { id: 'main', name: 'Pratos Principais' },
    { id: 'sides', name: 'Acompanhamentos' },
    { id: 'drinks', name: 'Bebidas' },
    { id: 'desserts', name: 'Sobremesas' }
  ];

  // Itens do menu
  menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Mufete Tradicional',
      description: 'Peixe grelhado com feijão de óleo de palma, banana, batata doce e faroja',
      price: 5000,
      image: 'https://loremflickr.com/80/80/food',
      category: 'main',
      available: true,
      popular: true
    },
    {
      id: 2,
      name: 'Calulu',
      description: 'Peixe seco com legumes, quiabo e óleo de palma',
      price: 4500,
      image: 'https://loremflickr.com/80/80/food',
      category: 'main',
      available: true,
      spicy: true
    },
    {
      id: 3,
      name: 'Moamba de Galinha',
      description: 'Galinha com molho de gimboa e funge',
      price: 4000,
      image: 'https://loremflickr.com/80/80/food',
      category: 'main',
      available: true
    },
    {
      id: 4,
      name: 'Sumo de Múcua',
      description: 'Bebida tradicional Mocambiquena',
      price: 1500,
      image: 'https://loremflickr.com/80/80/drink',
      category: 'drinks',
      available: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Inscreve-se nos parâmetros da rota
    this.routeSub = this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadRestaurantData(id);
    });

    // Inicializa os itens filtrados
    this.filterMenuItems();
  }

  ngOnDestroy(): void {
    // Limpa a inscrição para evitar memory leaks
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  private loadRestaurantData(id: number): void {
    // Simula carregamento de dados do restaurante
    this.restaurant = {
      id: id,
      name: 'Restaurante Tradicional',
      cuisine: 'Comida Mocambiquena',
      rating: 4.5,
      deliveryTime: 30,
      deliveryFee: 1500,
      image: 'https://picsum.photos/400/200?food',
      minOrder: 3000,
      isOpen: true,
      categories: ['tradicional', 'Mocambiquena']
    };
  }

  // Filtra itens do menu baseado na categoria selecionada
  filterMenuItems(): void {
    this.filteredMenuItems = this.menuItems.filter(item => 
      item.category === this.selectedCategory && item.available
    );
  }

  // Manipula mudança de categoria
  onCategoryChange(event: any): void {
    this.selectedCategory = event.detail.value;
    this.filterMenuItems();
  }

  // Adiciona item ao carrinho
  addToCart(item: MenuItem): void {
    if (!this.restaurant?.isOpen) {
      // Mostra mensagem de restaurante fechado
      return;
    }

    this.cartItems++;
    console.log('Added to cart:', item);
    // Aqui você implementaria a lógica de adicionar ao carrinho
  }

  // Navega de volta
  goBack(): void {
    this.location.back();
  }

  // Verifica se o pedido atinge o mínimo
  meetsMinOrder(): boolean {
    // Implementar lógica para verificar valor mínimo do pedido
    return true;
  }

  // Formata preço
  formatPrice(price: number): string {
    return price.toLocaleString('pt-MO', {
      style: 'currency',
      currency: 'MZN'
    });
  }
}