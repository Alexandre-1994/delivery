import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonNav } from '@ionic/angular/standalone';

// Interfaces
interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  addresses?: Address[];
  totalOrders?: number;
  memberSince?: Date;
  favoriteRestaurants?: number;
}

interface Order {
  id: string;
  date: Date;
  status: string;
  total: number;
  restaurantName: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    IonNav
  ]
})
export class ProfileComponent implements OnInit {
  user: User = {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+244 923 456 789',
    photoUrl: 'https://placehold.co/100x100',
    addresses: [
      {
        id: '1',
        street: 'Rua Principal',
        number: '123',
        neighborhood: 'Centro',
        city: 'Beira',
        state: 'Beira',
        zipCode: '12345-678',
        isDefault: true
      }
    ],
    totalOrders: 15,
    memberSince: new Date('2024-01-01'),
    favoriteRestaurants: 5
  };

  recentOrders: Order[] = [
    {
      id: '1',
      date: new Date(),
      status: 'Entregue',
      total: 5000,
      restaurantName: 'Restaurante Tradicional'
    },
    {
      id: '2',
      date: new Date(Date.now() - 86400000), // Ontem
      status: 'Entregue',
      total: 3500,
      restaurantName: 'Pizza Express'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Aqui você pode carregar dados do usuário de um serviço
    this.loadUserData();
  }

  loadUserData() {
    // Implementar carregamento de dados do usuário
    console.log('Carregando dados do usuário...');
  }

  editProfile() {
    // Navegar para página de edição de perfil
    this.router.navigate(['/consumer/profile/edit']);
  }

  async changePhoto() {
    // Implementar lógica de mudança de foto
    console.log('Mudando foto de perfil...');
  }

  async manageAddresses() {
    // Navegar para página de gerenciamento de endereços
    this.router.navigate(['/consumer/profile/addresses']);
  }

  async viewOrderHistory() {
    // Navegar para histórico de pedidos
    this.router.navigate(['/consumer/orders']);
  }

  async managePaymentMethods() {
    // Navegar para gerenciamento de métodos de pagamento
    this.router.navigate(['/consumer/profile/payment-methods']);
  }

  async openNotificationSettings() {
    // Abrir configurações de notificação
    this.router.navigate(['/consumer/profile/notifications']);
  }

  async openPrivacySettings() {
    // Abrir configurações de privacidade
    this.router.navigate(['/consumer/profile/privacy']);
  }

  async openHelp() {
    // Abrir página de ajuda
    this.router.navigate(['/consumer/help']);
  }

  async logout() {
    try {
      // Implementar lógica de logout aqui
      // Por exemplo: limpar token de autenticação, dados do usuário, etc.
      await this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Formatadores
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-AO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'MZN'
    });
  }

  // Handlers de eventos
  async handleAddressClick(address: Address) {
    // Implementar ação ao clicar em um endereço
    console.log('Endereço selecionado:', address);
  }

  async handleOrderClick(order: Order) {
    // Navegar para detalhes do pedido
    this.router.navigate(['/consumer/orders', order.id]);
  }

  async handleError(error: any) {
    console.error('Erro:', error);
    // Implementar tratamento de erro adequado
  }
}