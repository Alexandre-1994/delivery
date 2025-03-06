// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  // Adicione outros campos conforme necessário
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Redirecionar para login
  getUserName(): string {
    throw new Error('Method not implemented.');
  }
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Verificar se já temos token e usuário no localStorage
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    
    if (token) {
      this.tokenSubject.next(token);
    }
    
    if (user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        localStorage.removeItem('current_user');
      }
    }
  }
  
  login(credentials: { email: string, password: string }): Observable<User> {
    return this.http.post<any>(`${this.apiUrl}/customer/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.tokenSubject.next(response.token);
            localStorage.setItem('auth_token', response.token);
            
            if (response.user) {
              this.currentUserSubject.next(response.user);
              localStorage.setItem('current_user', JSON.stringify(response.user));
            }
          }
        }),
        map(response => response.user)
      );
  }
  
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/customer/create-account`, userData);
  }
  
  logout(): void {
    // Chamar endpoint de logout se necessário
    // this.http.post(`${this.apiUrl}/customer/logout`, {}, { headers: this.getAuthHeaders() }).subscribe();
    
    // Limpar dados locais
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    
    // Redirecionar para login
    this.router.navigate(['/auth/login']);
  }
  
  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }
  
  getToken(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }
  
  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }
  
  getAuthHeaders() {
    return {
      Authorization: `Bearer ${this.tokenSubject.value}`
    };
  }
}