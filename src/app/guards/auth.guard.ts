import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Everything under /panel needs a signed-in account; guests go to login and come back. */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const signedIn = !!localStorage.getItem('id') && !!localStorage.getItem('userData');
  if (signedIn) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
