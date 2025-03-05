// src/app/features/consumer/services/restaurant.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Restaurant {
  id: number;
  name: string;
  street: string;
  photo: string;
  phone: string;
  email: string;
  cover: string;
  addressLat: string;
  addressLng: string;
  neighborhood: string;
  city: string;
  province: string;
  opening_time: string | null;
  closing_time: string | null;
  created_at: string;
  updated_at: string;
  manager_id: number | null;
}

export interface Category {
  id: number;
  name: string;
  // outras propriedades da categoria
}

export interface Dish {
  id: number;
  name: string;
  price: number;
  description: string;
  photo: string;
  // outras propriedades do prato
}

export interface HomeData {
  restaurants: Restaurant[];
  categories: Category[];
  dishes: Dish[];
  topDishes: Dish[];
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = environment.apiUrl;
  private _cachedHomeData: HomeData | undefined = undefined;

  constructor(private http: HttpClient) {}

  getAllData(): Observable<HomeData> {
    // Se já temos dados em cache e não queremos recarregar
    if (this._cachedHomeData) {
      return new Observable(observer => {
        observer.next(this._cachedHomeData);
        observer.complete();
      });
    }
  
    return this.http.get<HomeData>(`${this.apiUrl}/customer/all`)
      .pipe(
        tap(data => {
          // Salvar em cache
          this._cachedHomeData = data;
        })
      );
  }

  getRestaurants(): Observable<Restaurant[]> {
    return this.getAllData().pipe(
      map(data => data.restaurants || [])
    );
  }

  getCategories(): Observable<Category[]> {
    return this.getAllData().pipe(
      map(data => data.categories || [])
    );
  }

  getTopDishes(): Observable<Dish[]> {
    return this.getAllData().pipe(
      map(data => data.topDishes || [])
    );
  }

  getRestaurantDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/customer/restaurant/details/${id}`).pipe(
      map(response => {
        // Adequar se sua API retornar um formato diferente
        return response.data || response;
      })
    );
  }
  clearCache() {
    this._cachedHomeData = undefined;
  }
}