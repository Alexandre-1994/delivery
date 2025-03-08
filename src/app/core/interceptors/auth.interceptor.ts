// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar se a requisição é para uma rota que não precisa de autenticação
  const isAuthRoute = req.url.includes('/auth/') || req.url.includes('/customer/login') || req.url.includes('/customer/create-account');
  if (isAuthRoute) {
    return next(req);
  }

  // Obter token válido (já verifica expiração)
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Salvar URL atual antes de fazer logout
        const currentUrl = router.url;
        if (currentUrl !== '/auth/login') {
          authService.setReturnUrl(currentUrl);
        }
        
        authService.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
};