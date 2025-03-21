// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

interface User {
  id: number;
  name: string;
  email: string;
  is_driver: number;
  // Adicione outros campos conforme necessário
}

interface LoginResponse {
  token: string;
  user: User;
  message?: string;
}

interface AuthData {
  token: string;
  expiresAt: number;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  provincia: string;
  city: string;
}

interface RegisterResponse {
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
  private readonly TOKEN_EXPIRATION_DAYS = 3;
  private authenticated: boolean = false;
  private returnUrl: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  // Carregar dados de autenticação do localStorage
  private loadStoredAuth(): void {
    const authDataStr = localStorage.getItem('auth_data');

    if (authDataStr) {
      try {
        const authData: AuthData = JSON.parse(authDataStr);
        const now = new Date().getTime();

        // Verificar se o token ainda não expirou
        if (authData.expiresAt > now) {
          this.tokenSubject.next(authData.token);
          this.currentUserSubject.next(authData.user);
          this.authenticated = true;
        } else {
          // Se expirou, limpar dados
          this.clearAuthData();
        }
      } catch {
        this.clearAuthData();
      }
    }
  }

  // Método para salvar dados de autenticação
  private saveAuthData(token: string, user: User): void {
    const expiresAt = new Date().getTime() + (this.TOKEN_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);
    const authData: AuthData = {
      token,
      expiresAt,
      user
    };

    localStorage.setItem('auth_data', JSON.stringify(authData));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.authenticated = true;
  }

  // Método para limpar dados de autenticação
  private clearAuthData(): void {
    localStorage.removeItem('auth_data');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.authenticated = false;
    this.returnUrl = '';
  }

  // Método para tratar erros de HTTP de forma consistente
  private handleHttpError(error: HttpErrorResponse, defaultMessage: string): Observable<never> {
    console.error('Erro na requisição:', error);
    let errorMessage = defaultMessage;

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
  }

  login(credentials: { email: string, password: string }): Observable<User> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}/customer/login`, credentials, { headers })
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.saveAuthData(response.token, response.user);

            // Redirecionar baseado no tipo de usuário
            const returnUrl = this.getReturnUrl();
            if (returnUrl) {
              this.router.navigateByUrl(returnUrl);
              this.clearReturnUrl();
            } else {
              if (response.user.is_driver === 1) {
                this.router.navigate(['/driver/deliveries']);
              } else {
                this.router.navigate(['/consumer/restaurants']);
              }
            }
          }
        }),
        map(response => response.user),
        catchError((error: HttpErrorResponse) => this.handleHttpError(error, 'Erro ao fazer login'))
      );
  }

  register(data: RegisterData): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      provincia: data.provincia,
      city: data.city
    };

    return this.http.post(
      `${this.apiUrl}/customer/profile/store`,
      payload,
      { headers }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Erro detalhado do registro:', error);
        return this.handleHttpError(error, error.error?.message || 'Erro ao criar conta');
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
    this.clearAuthData();

    // Redirecionar para login
    this.router.navigate(['/auth/login']);
  }

  validateToken(): Observable<boolean> {
    const token = this.tokenSubject.value;
    if (!token) {
      return of(false);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    });

    // Se não houver um endpoint específico para validação de token,
    // você pode usar uma rota protegida que requer autenticação
    return this.http.post<any>(`${this.apiUrl}/customer/validate-token`, {}, { headers })
      .pipe(
        map(response => true),
        catchError(error => {
          console.error('Erro ao validar token:', error);
          if (error.status === 401) {
            // Se o token for inválido, limpar dados de autenticação
            this.clearAuthData();
          }
          return of(false);
        })
      );
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getUserName(): string {
    const user = this.currentUserSubject.value;
    return user ? user.name : '';
  }

  getToken(): string | null {
    const authDataStr = localStorage.getItem('auth_data');
    if (!authDataStr) return null;

    try {
      const authData: AuthData = JSON.parse(authDataStr);
      return authData.expiresAt > new Date().getTime() ? authData.token : null;
    } catch {
      return null;
    }
  }

  get isAuthenticated(): boolean {
    return this.authenticated;
  }

  getAuthHeaders() {
    const token = this.tokenSubject.value;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  // Métodos auxiliares para URL de retorno
  private getReturnUrl(): string | null {
    return this.returnUrl || localStorage.getItem('returnUrl');
  }

  private clearReturnUrl(): void {
    localStorage.removeItem('returnUrl');
    this.returnUrl = '';
  }

  setReturnUrl(url: string): void {
    this.returnUrl = url;
    localStorage.setItem('returnUrl', url);
  }

  isDriver(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.is_driver === 1 : false;
  }
}
