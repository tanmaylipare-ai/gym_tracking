import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'workout', pathMatch: 'full' },
      {
        path: 'workout',
        loadComponent: () => import('./features/workout/workout-home.component').then(m => m.WorkoutHomeComponent)
      },
      {
        path: 'workout/active',
        loadComponent: () => import('./features/workout/active-workout.component').then(m => m.ActiveWorkoutComponent)
      },
      {
        path: 'routines',
        loadComponent: () => import('./features/routines/routines.component').then(m => m.RoutinesComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
