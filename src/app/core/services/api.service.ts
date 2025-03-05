import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;
  private token: string | null = null;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    // Verificar se já tem token armazenado
    this.token = localStorage.getItem('auth_token');
    this.isAuthenticatedSubject.next(!!this.token);
  }

  // Métodos de autenticação
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/login`, credentials)
      .pipe(
        tap((response: any) => {
          if (response.token) {
            this.setToken(response.token);
          }
        })
      );
  }

  createAccount(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/create-account`, userData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/logout`, {}, { headers: this.getAuthHeaders() })
      .pipe(
        tap(() => {
          this.clearToken();
        })
      );
  }

  // Helpers para autenticação
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
    this.isAuthenticatedSubject.next(true);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
    this.isAuthenticatedSubject.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Métodos para acessar endpoints da API
  // Restaurantes
  getAllRestaurants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/all`);
  }

  getRestaurantDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/restaurant/details/${id}`);
  }

  // Pedidos
  createOrder(orderData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/order/store`, orderData, { headers: this.getAuthHeaders() });
  }

  getOrderDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/order/confirm/${id}`, { headers: this.getAuthHeaders() });
  }

  getMyOrders(status: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/my-orders/${status}`, { headers: this.getAuthHeaders() });
  }

  // Perfil do usuário
  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/profile`, { headers: this.getAuthHeaders() });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/profile/update`, profileData, { headers: this.getAuthHeaders() });
  }

  // Endereços
  getAddresses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/address/list`, { headers: this.getAuthHeaders() });
  }

  addAddress(addressData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customer/address/store`, addressData, { headers: this.getAuthHeaders() });
  }

  updateAddress(id: number, addressData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/customer/address/update/${id}`, addressData, { headers: this.getAuthHeaders() });
  }

  deleteAddress(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customer/address/delete/${id}`, { headers: this.getAuthHeaders() });
  }

  // Métodos para entregadores
  getAvailableDeliveries(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/delivery/list`, { headers: this.getAuthHeaders() });
  }

  getDeliveryHistory(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/delivery/history`, { headers: this.getAuthHeaders() });
  }

  acceptDelivery(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/customer/accept/delivery/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  markAsCollected(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/customer/collect/delivery/${id}`, {}, { headers: this.getAuthHeaders() });
  }

  markAsDelivered(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/customer/complete/delivery/${id}`, {}, { headers: this.getAuthHeaders() });
  }
}