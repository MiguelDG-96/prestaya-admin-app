import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'rbac',
        loadComponent: () => import('./features/admin/rbac/rbac.component').then(m => m.RbacComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/client-list/client-list.component').then(m => m.ClientListComponent)
      },
      {
        path: 'loans',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/loans/loan-list/loan-list.component').then(m => m.LoanListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/loans/loan-form/loan-form.component').then(m => m.LoanFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/loans/loan-form/loan-form.component').then(m => m.LoanFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/loans/loan-detail/loan-detail.component').then(m => m.LoanDetailComponent)
          }
        ]
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
      },
      {
        path: 'rentals',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/rentals/rental-list/rental-list.component').then(m => m.RentalListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/rentals/rental-form/rental-form.component').then(m => m.RentalFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/rentals/rental-form/rental-form.component').then(m => m.RentalFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/rentals/rental-detail/rental-detail.component').then(m => m.RentalDetailComponent)
          }
        ]
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/tenants/tenant-list/tenant-list.component').then(m => m.TenantListComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notification-list/notification-list.component').then(m => m.NotificationListComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
