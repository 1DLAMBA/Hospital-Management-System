import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const hospitalGuard: CanActivateFn = () => {
  const router = inject(Router);
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');
  const isHospital = userData ? JSON.parse(userData)?.user?.user_type === 'hospital' : false;

  if (isHospital && token) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
