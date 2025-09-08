import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { DataStoreService } from './data-store';
import { catchError, map, of } from 'rxjs';

export const initialDataResolver: ResolveFn<boolean> = (route, state) => {
  const dataStore = inject(DataStoreService);
  const router = inject(Router);

  if (!localStorage.getItem('sessionCookie')) {
    return of(true);
  }

  return dataStore.fetchAllData().pipe(
    map(() => true), // On success, map the result to true
    catchError((err) => {
      console.error('Data resolver failed, logging out.', err);
      localStorage.removeItem('sessionCookie');
      router.navigate(['/login']);
      return of(false); // On error, prevent navigation
    })
  );
};

