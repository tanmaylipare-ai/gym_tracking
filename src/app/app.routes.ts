import { PrivacyComponent } from './policy/privacy/privacy.component';
import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [noAuthGuard]
  },
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
    path: 'privacy',
    loadComponent: () => import('./policy/privacy/privacy.component').then(m => m.PrivacyComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'terms',
    loadComponent: () => import('./policy/terms/terms.component').then(m => m.TermsComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'disclaimer',
    loadComponent: () => import('./policy/disclaimer/disclaimer.component').then(m => m.DisclaimerComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'about',
    loadComponent: () => import('./policy/about/about.component').then(m => m.AboutComponent),
    canActivate: [noAuthGuard]
  },
  {
    path: 'contact',
    loadComponent: () => import('./policy/contact/contact.component').then(m => m.ContactComponent),
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
        path: 'exercises',
        loadComponent: () => import('./features/exercises/exercise-list.component').then(m => m.ExerciseListComponent)
      },
      {
        path: 'exercises/:id',
        loadComponent: () => import('./features/exercises/exercise-detail.component').then(m => m.ExerciseDetailComponent)
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent)
      },
      {
        path: 'history/:id',
        loadComponent: () => import('./features/history/workout-detail.component').then(m => m.WorkoutDetailComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
