import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { interval, Subscription } from 'rxjs';
import { MapsLoaderService } from 'src/app/core/services/maps-loader.service';

declare var google: any;

interface DeliveryItem {
  id: number;
  name: string;
  quantity: number;
}

type DeliveryStatus = 'accepted' | 'collecting' | 'delivering' | 'delivered';

interface DeliveryTimeline {
  accepted?: Date;
  collecting?: Date;
  delivering?: Date;
  delivered?: Date;
}

interface CurrentDelivery {
  id: string;
  orderNumber: string;
  restaurantName: string;
  restaurantAddress: string;
  customerName: string;
  deliveryAddress: string;
  status: DeliveryStatus;
  items: DeliveryItem[];
  timeline: DeliveryTimeline;
}

@Component({
  selector: 'app-current-delivery',
  templateUrl: './current-delivery.component.html',
  styleUrls: ['./current-delivery.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CurrentDeliveryComponent implements OnInit, OnDestroy {
  @ViewChild('map') mapElement!: ElementRef;
  
  map: any;
  directionsService: any;
  directionsRenderer: any;
  currentPosition: any;
  estimatedTime: number = 0;
  remainingDistance: number = 0;
  locationWatchId: string | null = null;
  updateSubscription: Subscription | null = null;
  isDetailsOpen: boolean = false;
  modalBreakpoint: number = 0.25;
  currentDelivery: CurrentDelivery | null = null;

  constructor(
    private router: Router,
    private mapsLoader: MapsLoaderService
  ) {}

  async ngOnInit() {
    try {
      this.loadMockDelivery();
      await this.mapsLoader.loadGoogleMaps();
      await this.initializeMap();
      await this.startTracking();
    } catch (error) {
      console.error('Erro na inicialização:', error);
    }
  }

  ngOnDestroy() {
    this.stopTracking();
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  // Métodos de dados mockados
  loadMockDelivery() {
    this.currentDelivery = {
      id: '1',
      orderNumber: 'OD123456',
      restaurantName: 'Restaurante Tradicional',
      restaurantAddress: 'Rua Principal, 123 - Centro',
      customerName: 'João Silva',
      deliveryAddress: 'Avenida Central, 456 - Bairro Novo',
      status: 'accepted',
      items: [
        { id: 1, name: 'Mufete Tradicional', quantity: 1 },
        { id: 2, name: 'Sumo de Múcua', quantity: 2 }
      ],
      timeline: {
        accepted: new Date()
      }
    };
  }

  // Métodos de controle do modal
  closeDetails() {
    const modal = document.querySelector('ion-modal');
    if (modal) {
      modal.setCurrentBreakpoint(0.25);
    }
  }

  // Métodos de status e UI
  getStatusIcon(): string {
    if (!this.currentDelivery) return 'ellipse';

    switch (this.currentDelivery.status) {
      case 'accepted': return 'checkmark-circle';
      case 'collecting': return 'restaurant';
      case 'delivering': return 'bicycle';
      case 'delivered': return 'checkmark-done-circle';
      default: return 'ellipse';
    }
  }

  getStatusColor(): string {
    if (!this.currentDelivery) return 'medium';

    switch (this.currentDelivery.status) {
      case 'accepted': return 'warning';
      case 'collecting': return 'primary';
      case 'delivering': return 'tertiary';
      case 'delivered': return 'success';
      default: return 'medium';
    }
  }

  formatStatus(status: DeliveryStatus | undefined): string {
    if (!status) return '';
    
    const statusMap: Record<DeliveryStatus, string> = {
      'accepted': 'Pedido Aceito',
      'collecting': 'Coletando no Restaurante',
      'delivering': 'Em Rota de Entrega',
      'delivered': 'Entregue'
    };

    return statusMap[status];
  }

  isStepActive(step: DeliveryStatus): boolean {
    const statusOrder: DeliveryStatus[] = ['accepted', 'collecting', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.currentDelivery?.status || 'accepted');
    const stepIndex = statusOrder.indexOf(step);
    return currentIndex >= stepIndex;
  }

  getStepTime(step: keyof DeliveryTimeline): Date | null {
    return this.currentDelivery?.timeline[step] || null;
  }

  getNextActionText(): string {
    switch(this.currentDelivery?.status) {
      case 'accepted': return 'Cheguei ao Restaurante';
      case 'collecting': return 'Iniciar Entrega';
      case 'delivering': return 'Confirmar Entrega';
      case 'delivered': return 'Entrega Concluída';
      default: return 'Próximo Passo';
    }
  }

  // Métodos de ação
  async updateDeliveryStatus() {
    if (!this.currentDelivery) return;

    const statusFlow: Record<DeliveryStatus, DeliveryStatus | undefined> = {
      'accepted': 'collecting',
      'collecting': 'delivering',
      'delivering': 'delivered',
      'delivered': undefined
    };

    const nextStatus = statusFlow[this.currentDelivery.status];
    if (nextStatus) {
      this.currentDelivery.status = nextStatus;
      this.currentDelivery.timeline[nextStatus] = new Date();

      if (nextStatus === 'delivered') {
        setTimeout(() => {
          this.router.navigate(['/delivery/available-orders']);
        }, 2000);
      }
    }
  }

  openMap(address: string | undefined) {
    if (!address) return;
    console.log('Abrindo mapa para:', address);
  }

  contactSupport() {
    console.log('Contactando suporte...');
  }

  // Métodos de mapa e localização
  async initializeMap() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      
      const mapOptions = {
        zoom: 15,
        center: {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude
        },
        disableDefaultUI: true,
        styles: []
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true
      });

      await this.updateRoute();
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  async startTracking() {
    try {
      this.locationWatchId = await Geolocation.watchPosition({
        enableHighAccuracy: true,
        timeout: 1000,
        maximumAge: 3000
      }, (position, err) => {
        if (err) {
          console.error('Erro ao obter localização:', err);
          return;
        }
        this.updateDeliveryLocation(position);
      });

      this.updateSubscription = interval(30000).subscribe(() => {
        this.updateRoute();
      });
    } catch (error) {
      console.error('Erro ao iniciar rastreamento:', error);
    }
  }

  stopTracking() {
    if (this.locationWatchId) {
      Geolocation.clearWatch({ id: this.locationWatchId });
    }
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  async updateDeliveryLocation(position: any) {
    this.currentPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
    await this.updateRoute();
  }

  async updateRoute() {
    if (!this.currentPosition || !this.currentDelivery) return;

    try {
      const destination = this.currentDelivery.status === 'collecting' 
        ? this.currentDelivery.restaurantAddress 
        : this.currentDelivery.deliveryAddress;

      const request = {
        origin: this.currentPosition,
        destination: destination,
        travelMode: 'DRIVING'
      };

      const result = await this.directionsService.route(request);
      this.directionsRenderer.setDirections(result);

      const route = result.routes[0].legs[0];
      this.estimatedTime = Math.round(route.duration.value / 60);
      this.remainingDistance = parseFloat((route.distance.value / 1000).toFixed(1));
    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
    }
  }

  createCustomMarker(position: any, icon: string, title: string) {
    return new google.maps.Marker({
      position: position,
      map: this.map,
      icon: {
        url: icon,
        scaledSize: new google.maps.Size(32, 32)
      },
      title: title
    });
  }
}