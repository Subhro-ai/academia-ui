import { Routes } from '@angular/router';

export const routes: Routes = [
  // Add a redirect for the root path
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Add the route for your new login component
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  }
];