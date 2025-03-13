import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {

  constructor() {}

  getRestaurantLocation(restaurantId: number): { lat: number, lng: number } {
    // Mock data for restaurant location
    // In a real application, this data should be fetched from an API
    const restaurantLocations: { [key: number]: { lat: number, lng: number } } = {
      1: { lat: -19.841, lng: 34.838 },
      2: { lat: -19.842, lng: 34.839 },
      // Add more restaurant locations as needed
    };

    return restaurantLocations[restaurantId] || { lat: 0, lng: 0 };
  }
}
