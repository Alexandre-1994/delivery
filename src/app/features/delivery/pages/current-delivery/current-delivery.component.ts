import { Component, OnInit, ViewChild, ElementRef, OnDestroy  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { interval, Subscription } from 'rxjs';
// import { MapsLoaderService } from '../../core/services/maps-loader.service';
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
export class CurrentDeliveryComponent implements OnInit {

  @ViewChild('map')
  mapElement!: ElementRef;
  
  map: any;
  directionsService: any;
  directionsRenderer: any;
  currentPosition: any;
  estimatedTime: number = 0;
  remainingDistance: number = 0;
  locationWatchId!: string;
  updateSubscription!: Subscription;

  currentDelivery: CurrentDelivery | null = null;

  constructor(private router: Router, private mapsLoader: MapsLoaderService) {}

  // async ngOnInit() {
  //   this.loadMockDelivery();
  //   await this.initializeMap();
  //   this.startTracking();
  // }

  async ngOnInit() {
    try {
      this.loadMockDelivery();
      await this.mapsLoader.loadGoogleMaps(); // Carrega o Google Maps
      await this.initializeMap();
      this.startTracking();
    } catch (error) {
      console.error('Erro na inicialização:', error);
    }
  }
  ngOnDestroy() {
    this.stopTracking();
  }

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
      case 'accepted':
        return 'Cheguei ao Restaurante';
      case 'collecting':
        return 'Iniciar Entrega';
      case 'delivering':
        return 'Confirmar Entrega';
      case 'delivered':
        return 'Entrega Concluída';
      default:
        return 'Próximo Passo';
    }
  }

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

  async initializeMap() {
    try {
      // Obter localização atual
      const coordinates = await Geolocation.getCurrentPosition();
      
      const mapOptions = {
        zoom: 15,
        center: {
          lat: coordinates.coords.latitude,
          lng: coordinates.coords.longitude
        },
        disableDefaultUI: true,
        styles: [/* Seu estilo de mapa personalizado */]
      };

      // Criar mapa
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      
      // Inicializar serviços de direção
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true // Usaremos marcadores personalizados
      });

      // Atualizar rota inicial
      await this.updateRoute();
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
    }
  }

  async startTracking() {
    try {
      // Iniciar watch position
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

      // Atualizar rota a cada 30 segundos
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
    const newPosition = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };

    this.currentPosition = newPosition;
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

      // Atualizar tempo e distância estimados
      const route = result.routes[0].legs[0];
      this.estimatedTime = Math.round(route.duration.value / 60);
      this.remainingDistance = parseFloat((route.distance.value / 1000).toFixed(1));
    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
    }
  }

  // Método para criar marcadores personalizados
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