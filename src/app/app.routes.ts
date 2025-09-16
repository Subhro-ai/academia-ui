import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';
import { initialDataResolver } from './initial-data.resolver';
import { loginGuard } from './auth/login.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [loginGuard], 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main/main').then(m => m.Main),
    canActivate: [authGuard],
    resolve: { data: initialDataResolver },
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'attendance', loadComponent: () => import('./pages/attendance/attendance').then(m => m.Attendance) },
      { path: 'timetable', loadComponent: () => import('./pages/timetable/timetable').then(m => m.Timetable) },
      { path: 'internals', loadComponent: () => import('./pages/internals/internals').then(m => m.Internals) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
      { path: 'calendar', loadComponent: () => import('./pages/calendar/calendar').then(m => m.Calendar)},
      { path: 'cycle-tests', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard) },

    ]
  }
];