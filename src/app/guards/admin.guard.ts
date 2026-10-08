import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');
  const isAdmin = userData ? JSON.parse(userData)?.user?.user_type === 'admin' : false;

  if (isAdmin && token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
