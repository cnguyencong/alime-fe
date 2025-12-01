import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: 'parking',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'active' },
          {
            path: 'check-in',
            loadComponent: () =>
              import('./pages/parking/check-in/parking-check-in-page/parking-check-in-page').then(
                (m) => m.ParkingCheckInPage
              ),
          },
          {
            path: 'active',
            loadComponent: () =>
              import(
                './pages/parking/active/parking-active-list-page/parking-active-list-page'
              ).then((m) => m.ParkingActiveListPage),
          },
          {
            path: 'check-out',
            loadComponent: () =>
              import(
                './pages/parking/check-out/parking-check-out-page/parking-check-out-page'
              ).then((m) => m.ParkingCheckOutPage),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
