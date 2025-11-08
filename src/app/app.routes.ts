import { Routes } from '@angular/router';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'confirmation', loadComponent: () => import('./seat/confirmation/confirmation.component').then(m => m.ConfirmationComponent),

  },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'seat-selection', loadComponent: () => import('./seat/seat-selection/seat-selection.component').then(m => m.SeatSelectionComponent), canActivate: [authGuard] },
  { path: 'passenger-form', loadComponent: () => import('./seat/passenger-form/passenger-form.component').then(m => m.PassengerFormComponent), canActivate: [authGuard] },
  { path: 'modify', loadComponent: () => import('./seat/modify/modify.component').then(m => m.ModifyComponent), canActivate: [authGuard] },
  { path: 'cancel', loadComponent: () => import('./seat/cancel/cancel.component').then(m => m.CancelComponent), canActivate: [authGuard] },
  { path: 'my-reservations', loadComponent: () => import('./my-reservations/my-reservations.component').then(m => m.MyReservationsComponent), canActivate: [authGuard] },
  
  { path: 'modify-cancel', redirectTo: '/modify' },
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent), canActivate: [authGuard] },
  { path: 'xml-upload', loadComponent: () => import('./xml/xml-upload.component').then(m => m.XmlUploadComponent), canActivate: [authGuard]},
  { path: '**', redirectTo: '/login' }
];