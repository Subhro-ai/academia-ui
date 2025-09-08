import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const loginGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if the session cookie exists in local storage
  const sessionCookie = localStorage.getItem('sessionCookie');

  if (sessionCookie) {
    // If logged in, redirect to the dashboard and prevent access to the login page
    router.navigate(['/dashboard']);
    return false;
  } else {
    // If not logged in, allow access to the login page
    return true;
  }
};
