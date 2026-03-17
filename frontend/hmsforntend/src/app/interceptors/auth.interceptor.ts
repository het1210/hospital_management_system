import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const userId = authService.getUserId();
    const hospitalId = authService.getHospitalId();
    const user = localStorage.getItem('user');
    let roles = '';

    if (user) {
      const userData = JSON.parse(user);
      roles = userData.roles ? userData.roles.join(',') : '';
    }

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-User-Id': userId?.toString() || '',
        'X-Hospital-Id': hospitalId?.toString() || '',
        'X-Username': localStorage.getItem('username') || '',
        'X-User-Roles': roles
      }
    });
  }

  return next(req);
};
