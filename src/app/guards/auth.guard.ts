import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticatedSig()) {
    return true;
  }

  return authService.checkAuth().pipe(
    take(1),
    map(user => {
      if (user) {
        return true;
      }
      
      router.navigate(['/login']);
      return false;
    })
  );
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticatedSig()) {
    router.navigate(['/']);
    return false;
  }

  return true;
}; 