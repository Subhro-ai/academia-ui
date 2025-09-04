import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  // Check if the session cookie exists in local storage
  const sessionCookie = localStorage.getItem('sessionCookie');

  if (sessionCookie) {
    // If the user is logged in, allow them to access the route
    return true;
  } else {
    // If the user is not logged in, redirect them to the login page
    router.navigate(['/login']);
    return false;
  }
};
