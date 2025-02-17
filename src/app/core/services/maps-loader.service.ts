import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapsLoaderService {
  private mapsLoaded = false;

  async loadGoogleMaps(): Promise<void> {
    if (this.mapsLoaded) {
      return;
    }

    try {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.mapsLoaded = true;
          resolve();
        };
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Erro ao carregar Google Maps:', error);
      throw error;
    }
  }
}