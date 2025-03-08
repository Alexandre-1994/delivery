import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { TrackingService, TrackingInfo } from '../../services/tracking.service';
import { interval, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

declare var google: any;

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  @Input() orderId!: number;
  @ViewChild('mapElement') mapElement!: ElementRef;
  
  trackingInfo?: TrackingInfo;
  map?: any;
  driverMarker?: any;
  restaurantMarker?: any;
  destinationMarker?: any;
  routePath?: any;
  distance: number = 0;
  estimatedTime: number = 0;
  private updateSubscription?: Subscription;

  constructor(
    private trackingService: TrackingService,
    private modalCtrl: ModalController
  ) {}

  ngOnInit() {
    // Carregar informações iniciais
    this.loadTrackingInfo();
    
    // Atualizar a cada 30 segundos
    this.updateSubscription = interval(30000).subscribe(() => {
      this.loadTrackingInfo();
    });
  }

  ngOnDestroy() {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  async loadTrackingInfo() {
    try {
      console.log('Carregando informações do pedido:', this.orderId);
      const info = await this.trackingService.getTrackingInfo(this.orderId).toPromise();
      console.log('Informações recebidas:', info);
      this.trackingInfo = info;
      
      if (this.trackingInfo) {
        // Inicializar mapa se ainda não foi inicializado
        if (!this.map) {
          await this.initMap();
        }
        
        this.updateMapMarkers();
        this.calculateDistanceAndTime();
        this.updateRoute();
      }
    } catch (error) {
      console.error('Erro ao carregar informações de rastreamento:', error);
    }
  }

  private async initMap() {
    if (!this.trackingInfo) return;

    // Verificar se o Google Maps está disponível
    if (!google || !google.maps) {
      console.error('Google Maps não está carregado. Verifique se a chave de API está configurada corretamente.');
      return;
    }

    try {
      const restaurantLocation = {
        lat: parseFloat(this.trackingInfo.restaurant_info.addressLat),
        lng: parseFloat(this.trackingInfo.restaurant_info.addressLng)
      };

      const mapOptions = {
        center: restaurantLocation,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      // Criar marcadores
      this.restaurantMarker = new google.maps.Marker({
        position: restaurantLocation,
        map: this.map,
        icon: {
          url: 'assets/icons/restaurant-marker.svg',
          scaledSize: new google.maps.Size(40, 40)
        },
        title: this.trackingInfo.restaurant_info.name
      });

      const destinationLocation = {
        lat: parseFloat(this.trackingInfo.destination_latitude),
        lng: parseFloat(this.trackingInfo.destination_longitude)
      };

      this.destinationMarker = new google.maps.Marker({
        position: destinationLocation,
        map: this.map,
        icon: {
          url: 'assets/icons/destination-marker.svg',
          scaledSize: new google.maps.Size(40, 40)
        },
        title: 'Destino'
      });

      if (this.trackingInfo.driver_latitude && this.trackingInfo.driver_longitude) {
        const driverLocation = {
          lat: parseFloat(this.trackingInfo.driver_latitude),
          lng: parseFloat(this.trackingInfo.driver_longitude)
        };

        this.driverMarker = new google.maps.Marker({
          position: driverLocation,
          map: this.map,
          icon: {
            url: 'assets/icons/driver-marker.svg',
            scaledSize: new google.maps.Size(40, 40)
          },
          title: 'Entregador'
        });
      }

      // Ajustar zoom para mostrar todos os marcadores
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(restaurantLocation);
      bounds.extend(destinationLocation);
      if (this.driverMarker) {
        bounds.extend(this.driverMarker.getPosition());
      }
      this.map.fitBounds(bounds);
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
    }
  }

  private updateMapMarkers() {
    if (!this.trackingInfo || !this.map) return;

    // Atualizar posição do motorista
    if (this.trackingInfo.driver_latitude && this.trackingInfo.driver_longitude) {
      const driverLocation = {
        lat: parseFloat(this.trackingInfo.driver_latitude),
        lng: parseFloat(this.trackingInfo.driver_longitude)
      };

      if (this.driverMarker) {
        // Animação suave para a nova posição
        this.animateMarker(this.driverMarker, driverLocation);
      } else {
        this.driverMarker = new google.maps.Marker({
          position: driverLocation,
          map: this.map,
          icon: {
            url: 'assets/icons/driver-marker.svg',
            scaledSize: new google.maps.Size(40, 40)
          },
          title: 'Entregador'
        });
      }
    }
  }

  private animateMarker(marker: any, newPosition: any) {
    const duration = 1000; // Duração da animação em milissegundos
    const fps = 60; // Frames por segundo
    const frames = duration / (1000 / fps);
    
    const oldLat = marker.getPosition().lat();
    const oldLng = marker.getPosition().lng();
    const latDiff = (newPosition.lat - oldLat) / frames;
    const lngDiff = (newPosition.lng - oldLng) / frames;
    
    let frame = 0;
    
    const animate = () => {
      frame++;
      
      const lat = oldLat + (latDiff * frame);
      const lng = oldLng + (lngDiff * frame);
      
      marker.setPosition({ lat, lng });
      
      if (frame < frames) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }

  private async updateRoute() {
    if (!this.trackingInfo || !this.map) return;

    // Remover rota anterior se existir
    if (this.routePath) {
      this.routePath.setMap(null);
    }

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#4A90E2',
        strokeWeight: 4
      }
    });

    const origin = this.driverMarker ? 
      this.driverMarker.getPosition() : 
      new google.maps.LatLng(
        parseFloat(this.trackingInfo.restaurant_info.addressLat),
        parseFloat(this.trackingInfo.restaurant_info.addressLng)
      );

    const destination = new google.maps.LatLng(
      parseFloat(this.trackingInfo.destination_latitude),
      parseFloat(this.trackingInfo.destination_longitude)
    );

    try {
      const result = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      });

      directionsRenderer.setDirections(result);
      this.routePath = directionsRenderer;
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
    }
  }

  private calculateDistanceAndTime() {
    if (!this.trackingInfo) return;

    const startLat = this.trackingInfo.driver_latitude || this.trackingInfo.restaurant_info.addressLat;
    const startLng = this.trackingInfo.driver_longitude || this.trackingInfo.restaurant_info.addressLng;

    this.distance = this.trackingService.calculateDistance(
      startLat,
      startLng,
      this.trackingInfo.destination_latitude,
      this.trackingInfo.destination_longitude
    );

    this.estimatedTime = this.trackingService.estimateDeliveryTime(this.distance);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendente',
      'preparing': 'Em Preparação',
      'ready': 'Pronto para Entrega',
      'delivering': 'Em Entrega',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'pending': 'warning',
      'preparing': 'primary',
      'ready': 'tertiary',
      'delivering': 'tertiary',
      'delivered': 'success',
      'cancelled': 'danger'
    };
    return colorMap[status] || 'medium';
  }

  getDeliveryAddress(): string {
    if (!this.trackingInfo) return '';
    
    const address = this.trackingInfo.addres_info;
    return `${address.street}, ${address.block}, ${address.neighborhood}, ${address.city}`;
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(value: string | number): string {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'MZN'
    }).format(numValue);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
} 