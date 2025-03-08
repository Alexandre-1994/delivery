import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DriverGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated && this.authService.isDriver()) {
      return true;
    }
    
    // Se não estiver autenticado, redireciona para login
    if (!this.authService.isAuthenticated) {
      this.authService.setReturnUrl(state.url);
      return this.router.createUrlTree(['/auth/login']);
    }
    
    // Se estiver autenticado mas não for entregador, redireciona para home do consumidor
    return this.router.createUrlTree(['/consumer/restaurants']);
  }
} 