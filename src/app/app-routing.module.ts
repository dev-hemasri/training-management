// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'master',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/master/master.module').then(m => m.MasterModule)
  },
  {
    path: 'training',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/training/training.module').then(m => m.TrainingModule)
  },
  {
    path: 'members',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/members/members.module').then(m => m.MembersModule)
  },
  {
    path: 'forms',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/forms/forms.module').then(m => m.FormModule)
  },
  {
    path: 'reports',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/reports/reports.module').then(m => m.ReportsModule)
  },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
