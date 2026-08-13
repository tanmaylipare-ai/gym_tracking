import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';
import { LandingPageComponent } from './marketing/landing-page/landing-page.component';
import { ShellComponent } from './shared/components/shell.component';

export const routes: Routes = [
  // --- PUBLIC UN-AUTHENTICATED ROUTES ---
  {
    path: 'hero',
    component: LandingPageComponent, // ✅ Eagerly loaded
    canActivate: [noAuthGuard]
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard],
    data: { preload: true } // 🚀 Preloaded in background
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent),
    canActivate: [noAuthGuard],
    data: { preload: true } // 🚀 Preloaded in background
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [noAuthGuard] // 😴 Lazy loaded
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent),
    canActivate: [noAuthGuard] // 😴 Lazy loaded
  },

  // --- POLICIES (ALL LAZY LOADED 😴) ---
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

  // --- APP PROTECTED SHELL ---
  {
    path: '',
    component: ShellComponent, // ✅ Eagerly loaded shell layout
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'workout', pathMatch: 'full' },
      {
        path: 'workout',
        loadComponent: () => import('./features/workout/workout-home.component').then(m => m.WorkoutHomeComponent),
        data: { preload: true } // 🚀 Preloaded in background
      },
      {
        path: 'workout/active',
        loadComponent: () => import('./features/workout/active-workout.component').then(m => m.ActiveWorkoutComponent),
        data: { preload: true } // 🚀 Preloaded in background
      },
      {
        path: 'routines',
        loadComponent: () => import('./features/routines/routines.component').then(m => m.RoutinesComponent) // 😴 Lazy
      },
      {
        path: 'exercises',
        loadComponent: () => import('./features/exercises/exercise-list.component').then(m => m.ExerciseListComponent) // 😴 Lazy
      },
      {
        path: 'exercises/:id',
        loadComponent: () => import('./features/exercises/exercise-detail.component').then(m => m.ExerciseDetailComponent) // 😴 Lazy
      },
      {
        path: 'history',
        loadComponent: () => import('./features/history/history.component').then(m => m.HistoryComponent) // 😴 Lazy
      },
      {
        path: 'history/:id',
        loadComponent: () => import('./features/history/workout-detail.component').then(m => m.WorkoutDetailComponent) // 😴 Lazy
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent) // 😴 Lazy
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) // 😴 Lazy
      }
    ]
  },
  { 
    path: '**', 
    loadComponent: () => import('./not-found/not-found.component').then(m => m.NotFoundComponent) // 😴 Lazy
  }
];