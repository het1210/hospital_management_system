import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

export const authRole:CanActivateFn = (route, state) =>{
  const authService = inject(AuthService);
  const router = inject(Router);


  if(authService.isLoggedIn() && authService.hasRole(['superadmin'])){
    return true;
  }

  if(authService.isLoggedIn() && authService.hasRole(['hospitaladmin'])){
    return true;
  }

  router.navigate(['/dashboard']);
  return false;  
}
