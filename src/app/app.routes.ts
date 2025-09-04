import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },


  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main/main').then(m => m.Main),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance').then(m => m.Attendance) },
      { path: 'timetable', loadComponent: () => import('./pages/timetable/timetable').then(m => m.Timetable) },
      { path: 'internals', loadComponent: () => import('./pages/internals/internals').then(m => m.Internals) },

    ]
  }
];