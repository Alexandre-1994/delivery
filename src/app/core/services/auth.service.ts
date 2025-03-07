// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  // Adicione outros campos conforme necessário
}

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}/customer/login`, credentials, { headers })
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
        map(response => response.user),
        catchError((error: HttpErrorResponse) => {
          console.error('Erro de autenticação:', error);
          let errorMessage = 'Erro ao fazer login';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  
  register(userData: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/customer/create-account`, userData, { headers })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Erro no registro:', error);
          let errorMessage = 'Erro ao criar conta';
          
          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.error) {
              errorMessage = error.error.error;
            }
          }
          
          return throwError(() => new Error(errorMessage));
        })
      );
  }
  
  logout(): void {
    const token = this.tokenSubject.value;
    if (token) {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      });
      
      // Tentar fazer logout no servidor
      this.http.post(`${this.apiUrl}/customer/logout`, {}, { headers })
        .subscribe({
          error: (error) => console.error('Erro ao fazer logout no servidor:', error)
        });
    }
    
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
  
  getUserName(): string {
    const user = this.currentUserSubject.value;
    return user ? user.name : '';
  }
  
  getToken(): string | null {
    return this.tokenSubject.value;
  }
  
  get isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }
  
  getAuthHeaders() {
    const token = this.tokenSubject.value;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}