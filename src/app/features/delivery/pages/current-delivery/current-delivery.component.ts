// TypeScript - Implementações que faltam
import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MapsLoaderService } from 'src/app/core/services/maps-loader.service';
import { DeliveryService, Delivery } from '../../services/delivery.service';
import { take } from 'rxjs/operators';

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
  @ViewChild('map', { static: false }) mapElement!: ElementRef;
  
  map: any;
  directionsService: any;
  directionsRenderer: any;
  currentPosition: any;
  estimatedTime: number = 0;
  remainingDistance: number = 0;
  locationWatchId: string | null = null;
  updateSubscription: Subscription | null = null;
  deliverySubscription!: Subscription;
  isDetailsOpen: boolean = false;
  modalBreakpoint: number = 0.25;
  currentDelivery: CurrentDelivery | null = null;

  constructor(
    private router: Router,
    private mapsLoader: MapsLoaderService,
    private deliveryService: DeliveryService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    try {
      await this.loadCurrentDelivery();
      await this.mapsLoader.loadGoogleMaps();
      await this.initializeMap();
    } catch (error) {
      console.error('Erro na inicialização:', error);
      this.showToast('Erro ao inicializar. Tente novamente.');
    }
  }

  async initializeMap() {
    // Verifica se o elemento do mapa está disponível
    if (!this.mapElement) {
      console.error('Elemento do mapa não encontrado');
      return;
    }

    try {
      // Opções padrão para o mapa
      const mapOptions = {
        zoom: 15,
        center: { lat: -25.969, lng: 32.573 }, // Coordenadas padrão (ajuste conforme necessário)
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
      };

      // Inicializa o mapa
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      
      // Inicializa serviços de direções
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#4285F4',
          strokeWeight: 5
        }
      });

      // Obtém a posição atual
      await this.getCurrentPosition();
      
      // Inicia o rastreamento da localização
      this.startTracking();
      
      // Calcula rota se tiver os endereços
      if (this.currentDelivery) {
        this.calculateRoute();
      }
    } catch (error) {
      console.error('Erro ao inicializar o mapa:', error);
      this.showToast('Erro ao carregar o mapa');
    }
  }

  ngOnDestroy() {
    this.stopTracking();
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
    if (this.deliverySubscription) {
      this.deliverySubscription.unsubscribe();
    }
  }

  async getCurrentPosition(): Promise<any> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(this.currentPosition);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  }

  startTracking() {
    this.locationWatchId = String(navigator.geolocation.watchPosition(
      (position) => {
        this.currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        // Atualiza o mapa com a nova posição
        if (this.map && this.currentDelivery) {
          this.updateMapPosition();
          this.calculateRoute();
        }
      },
      (error) => {
        console.error('Erro no rastreamento:', error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    ));
  }

  updateMapPosition() {
    if (!this.map || !this.currentPosition) return;
    
    // Atualiza a posição do mapa
    this.map.setCenter(this.currentPosition);
    
    // Cria ou atualiza o marcador do entregador
    if (!this.deliveryMarker) {
      this.deliveryMarker = new google.maps.Marker({
        position: this.currentPosition,
        map: this.map,
        icon: {
          url: 'assets/images/delivery-icon.png',
          scaledSize: new google.maps.Size(40, 40)
        }
      });
    } else {
      this.deliveryMarker.setPosition(this.currentPosition);
    }
  }

  deliveryMarker: any = null;
  restaurantMarker: any = null;
  customerMarker: any = null;

  calculateRoute() {
    if (!this.currentDelivery || !this.currentPosition) return;
    
    // Determina origem e destino com base no status atual
    let origin, destination;
    
    if (this.currentDelivery.status === 'accepted' || this.currentDelivery.status === 'collecting') {
      // Rota do entregador para o restaurante
      origin = this.currentPosition;
      destination = this.currentDelivery.restaurantAddress;
    } else {
      // Rota do restaurante para o cliente
      origin = this.currentPosition;
      destination = this.currentDelivery.deliveryAddress;
    }

    const request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
        
        // Atualiza tempo estimado e distância
        const route = result.routes[0];
        if (route && route.legs[0]) {
          this.estimatedTime = Math.round(route.legs[0].duration.value / 60);
          this.remainingDistance = parseFloat((route.legs[0].distance.value / 1000).toFixed(1));
        }
        
        // Adiciona marcadores
        this.addRouteMarkers();
      } else {
        console.error('Erro ao calcular rota:', status);
      }
    });
  }

  addRouteMarkers() {
    if (!this.map || !this.currentDelivery) return;
    
    // Limpa marcadores anteriores
    if (this.restaurantMarker) this.restaurantMarker.setMap(null);
    if (this.customerMarker) this.customerMarker.setMap(null);
    
    // Geocode para obter coordenadas do restaurante
    const geocoder = new google.maps.Geocoder();
    
    // Marcador do restaurante
    geocoder.geocode({ address: this.currentDelivery.restaurantAddress }, (results: any, status: any) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        this.restaurantMarker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          icon: {
            url: 'assets/images/restaurant-icon.png',
            scaledSize: new google.maps.Size(40, 40)
          }
        });
      }
    });
    
    // Marcador do cliente
    geocoder.geocode({ address: this.currentDelivery.deliveryAddress }, (results: any, status: any) => {
      if (status === google.maps.GeocoderStatus.OK && results[0]) {
        this.customerMarker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          icon: {
            url: 'assets/images/customer-icon.png',
            scaledSize: new google.maps.Size(40, 40)
          }
        });
      }
    });
  }

  async loadCurrentDelivery() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando entrega...'
    });
    await loading.present();

    try {
      this.deliverySubscription = this.deliveryService.getCurrentDelivery().subscribe(
        delivery => {
          if (delivery) {
            this.mapDeliveryData(delivery);
          } else {
            this.router.navigate(['/delivery/available-orders']);
          }
        }
      );
    } catch (error) {
      console.error('Erro ao carregar entrega:', error);
      this.showToast('Erro ao carregar detalhes da entrega');
      this.router.navigate(['/delivery/available-orders']);
    } finally {
      loading.dismiss();
    }
  }

  mapDeliveryData(apiDelivery: Delivery) {
    this.currentDelivery = {
      id: apiDelivery.id,
      orderNumber: apiDelivery.id,
      restaurantName: apiDelivery.restaurant_name,
      restaurantAddress: apiDelivery.restaurant_address,
      customerName: apiDelivery.customer_name,
      deliveryAddress: apiDelivery.customer_address,
      status: this.mapApiStatusToAppStatus(apiDelivery.status),
      items: apiDelivery.items || [],
      timeline: { accepted: new Date() }
    };

    if (apiDelivery.updated_at) {
      const updatedAt = new Date(apiDelivery.updated_at);
      if (apiDelivery.status === 'collected') this.currentDelivery.timeline.collecting = updatedAt;
      if (apiDelivery.status === 'delivering') this.currentDelivery.timeline.delivering = updatedAt;
      if (apiDelivery.status === 'delivered') this.currentDelivery.timeline.delivered = updatedAt;
    }
  }

  mapApiStatusToAppStatus(apiStatus: string): DeliveryStatus {
    switch(apiStatus) {
      case 'accepted': return 'accepted';
      case 'collected': return 'collecting';
      case 'delivering': return 'delivering';
      case 'delivered': return 'delivered';
      default: return 'accepted';
    }
  }

  // MÉTODOS USADOS NO TEMPLATE QUE FALTAVAM
  isStepActive(step: string): boolean {
    if (!this.currentDelivery) return false;
    
    const statusOrder = ['accepted', 'collecting', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(this.currentDelivery.status);
    const stepIndex = statusOrder.indexOf(step);
    
    return stepIndex <= currentIndex;
  }

  getStepTime(step: keyof DeliveryTimeline): Date | null {
    if (!this.currentDelivery || !this.currentDelivery.timeline) return null;
    return this.currentDelivery.timeline[step] || null;
  }

  getNextActionText(): string {
    if (!this.currentDelivery) return 'Atualizar';
    
    switch(this.currentDelivery.status) {
      case 'accepted': return 'Confirmar Coleta';
      case 'collecting': return 'Iniciar Entrega';
      case 'delivering': return 'Confirmar Entrega';
      case 'delivered': return 'Entrega Concluída';
      default: return 'Atualizar';
    }
  }

  openMap(address: string | undefined) {
    if (!address) return;
    
    // Abre o Google Maps com o endereço
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_system');
  }

  async contactSupport() {
    const alert = await this.alertCtrl.create({
      header: 'Contato de Suporte',
      message: 'Entre em contato com nossa equipe pelo número: (84) 99999-9999',
      buttons: ['OK']
    });
    await alert.present();
  }

  async updateDeliveryStatus() {
    if (!this.currentDelivery) return;

    const loading = await this.loadingCtrl.create({
      message: 'Atualizando status...'
    });
    await loading.present();

    try {
      let result;
      const deliveryId = Number(this.currentDelivery.id);

      switch(this.currentDelivery.status) {
        case 'accepted':
          result = await this.deliveryService.markAsCollected(deliveryId).pipe(take(1)).toPromise();
          this.currentDelivery.status = 'collecting';
          this.currentDelivery.timeline.collecting = new Date();
          break;
        case 'collecting':
          // result = await this.deliveryService.markAsDelivering(deliveryId).pipe(take(1)).toPromise();
          // this.currentDelivery.status = 'delivering';
          // this.currentDelivery.timeline.delivering = new Date();
          break;
        case 'delivering':
          result = await this.deliveryService.markAsDelivered(deliveryId).pipe(take(1)).toPromise();
          this.currentDelivery.status = 'delivered';
          this.currentDelivery.timeline.delivered = new Date();
          
          setTimeout(() => {
            this.showToast('Entrega concluída com sucesso!');
            this.router.navigate(['/delivery/available-orders']);
          }, 2000);
          break;
      }

      this.showToast('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      this.showToast('Erro ao atualizar status da entrega');
    } finally {
      loading.dismiss();
    }
  }

  async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  stopTracking() {
    if (this.locationWatchId) {
      navigator.geolocation.clearWatch(Number(this.locationWatchId));
      this.locationWatchId = null;
    }
  }
}