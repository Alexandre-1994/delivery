import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule, LoadingController, ToastController } from '@ionic/angular';
import { DeliveryService, Delivery } from '../../services/delivery.service';
import { firstValueFrom } from 'rxjs';

// Interface que mapeia o modelo do API para o formato usado na view
interface AvailableOrderViewModel {
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
  imports: [CommonModule, IonicModule, FormsModule, RouterModule],
})
export class AvailableOrdersComponent implements OnInit {
  isOnline: boolean = false;
  availableOrders: AvailableOrderViewModel[] = [];
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private deliveryService: DeliveryService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    // Verificar se existe status salvo (pode ser adicionado posteriormente)
    // this.isOnline = localStorage.getItem('deliveryOnlineStatus') === 'true';
    // if (this.isOnline) {
    //   this.loadAvailableOrders();
    // }
  }

  async toggleOnlineStatus() {
    this.isOnline = !this.isOnline;
    
    // Opcionalmente, salvar o status (pode ser adicionado posteriormente)
    // localStorage.setItem('deliveryOnlineStatus', this.isOnline.toString());

    if (this.isOnline) {
      await this.loadAvailableOrders();
    } else {
      this.availableOrders = [];
    }
  }

  async loadAvailableOrders() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando entregas disponíveis...',
    });
    await loading.present();
    this.isLoading = true;

    try {
      // Usando firstValueFrom em vez de toPromise (obsoleto)
      const deliveries = await firstValueFrom(this.deliveryService.getAvailableDeliveries());
      
      // Mapeando para o formato esperado pela view
      this.availableOrders = (deliveries || []).map(delivery => this.mapDeliveryToViewModel(delivery));
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
      this.showToast('Erro ao carregar entregas disponíveis');
      this.availableOrders = [];
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  // Função que mapeia o modelo da API para o viewModel
  mapDeliveryToViewModel(delivery: Delivery): AvailableOrderViewModel {
    return {
      id: delivery.id,
      restaurantName: delivery.restaurant_name || 'Restaurante',
      restaurantAddress: delivery.restaurant_address || 'Endereço não disponível',
      deliveryAddress: delivery.customer_address || 'Endereço não disponível',
      distance: this.calculateDistance(delivery),
      estimatedTime: this.calculateTime(delivery),
      value: delivery.total || 0,
      items: delivery.items?.length || 0
    };
  }

  // Calcula distância com base em coordenadas (simulado)
  calculateDistance(delivery: Delivery): number {
    // Aqui você poderia fazer um cálculo real se tivesse as coordenadas
    // Por enquanto, vamos simular um valor entre 1 e 10 km
    return Math.round((Math.random() * 9 + 1) * 10) / 10;
  }

  // Calcula tempo estimado (simulado)
  calculateTime(delivery: Delivery): number {
    // Aqui poderia usar a distância e velocidade média para calcular
    // Por enquanto, simularemos um valor entre 15 e 45 minutos
    return Math.round(Math.random() * 30) + 15;
  }

  async acceptOrder(order: AvailableOrderViewModel) {
    const loading = await this.loadingCtrl.create({
      message: 'Aceitando entrega...',
    });
    await loading.present();

    try {
      // Usando firstValueFrom em vez de toPromise (obsoleto)
      const result = await firstValueFrom(this.deliveryService.acceptDelivery(Number(order.id)));

      if (result?.success) {
        this.showToast('Entrega aceita com sucesso!');
        this.router.navigate(['/delivery/current-delivery']);
      } else {
        this.showToast(result?.message || 'Não foi possível aceitar a entrega');
      }
    } catch (error) {
      console.error('Erro ao aceitar entrega:', error);
      this.showToast('Erro ao aceitar a entrega');
    } finally {
      loading.dismiss();
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 2000,
      position: 'bottom',
    });
    toast.present();
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-AO', {
      style: 'currency',
      currency: 'AOA',
    });
  }
}