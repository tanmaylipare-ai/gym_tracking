import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkoutService } from '../../core/services/workout.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, DatePipe, RouterLink],
    template: `
    <div class="px-4 pt-6 pb-8 safe-top">

      <!-- Header -->
      <h1 class="text-2xl px-1 pt-2 font-bold mb-6">Profile</h1>

      <!-- Avatar + name -->
      <div class="card rounded-2xl p-5 mb-4">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-full bg-gym-accent flex items-center justify-center flex-shrink-0">
            <span class="text-2xl font-bold text-white">{{ initials() }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-lg font-bold truncate">{{ user()?.name }}</p>
            <p class="text-gym-muted text-sm truncate">{{ user()?.email }}</p>
            @if (user()?.createdAt) {
              <p class="text-xs text-gym-muted mt-1">
                Member since {{ user()?.createdAt | date:'MMMM yyyy' }}
              </p>
            }
          </div>
        </div>
      </div>

      <!-- Stats card -->
      <div class="card rounded-2xl p-5 mb-4">
        <h2 class="section-title mb-4">Stats</h2>
        <div class="grid grid-cols-3 gap-4 text-center">
          <div>
            <p class="text-2xl font-bold text-gym-accent">{{ totalWorkouts() }}</p>
            <p class="text-[11px] text-gym-muted mt-1 uppercase tracking-wide">Workouts</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-gym-accent">{{ totalSets() }}</p>
            <p class="text-[11px] text-gym-muted mt-1 uppercase tracking-wide">Sets</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-gym-accent">{{ streakDays() }}</p>
            <p class="text-[11px] text-gym-muted mt-1 uppercase tracking-wide">Day streak</p>
          </div>
        </div>
      </div>

      <!-- Analytics link -->
      <a
        routerLink="/analytics"
        class="w-full card rounded-2xl px-5 py-4 mb-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2"/>
          </svg>
          <span class="text-sm font-medium">Analytics</span>
        </div>
        <svg class="w-4 h-4 text-gym-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
      </a>

      <!-- Settings rows -->
      <div class="card rounded-2xl mb-4 divide-y divide-gym-border">

        <!-- Appearance / theme -->
        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span class="text-sm font-medium">Appearance</span>
          </div>
          <div class="flex gap-1 bg-gym-surface rounded-full p-1">
            <button
              type="button"
              (click)="theme.set('light')"
              class="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
              [class.bg-gym-accent]="theme() === 'light'"
              [class.text-white]="theme() === 'light'"
              [class.text-gym-muted]="theme() !== 'light'"
            >
              Light
            </button>
            <button
              type="button"
              (click)="theme.set('dark')"
              class="px-3 py-1.5 text-xs font-semibold rounded-full transition-colors"
              [class.bg-gym-accent]="theme() === 'dark'"
              [class.text-white]="theme() === 'dark'"
              [class.text-gym-muted]="theme() !== 'dark'"
            >
              Dark
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            <span class="text-sm font-medium">Notifications</span>
          </div>
          <span class="text-xs text-gym-muted">Coming soon</span>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
            </svg>
            <span class="text-sm font-medium">Weight unit</span>
          </div>
          <span class="text-xs text-gym-muted">kg</span>
        </div>
      </div>

      <!-- Logout -->
      <button (click)="confirmLogout()" class="w-full card rounded-2xl px-5 py-4 flex items-center gap-3 text-gym-accent">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
        </svg>
        <span class="font-semibold">Sign out</span>
      </button>

      <!-- Logout confirm modal -->
      @if (showLogoutConfirm()) {
        <div class="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4" (click)="showLogoutConfirm.set(false)">
          <div class="w-full max-w-md mx-auto card rounded-2xl p-5 space-y-3" (click)="$event.stopPropagation()">
            <h3 class="font-bold text-lg">Sign out?</h3>
            <p class="text-gym-muted text-sm">You'll need to sign back in to access your workouts.</p>
            <button (click)="logout()" class="w-full bg-gym-accent text-white font-semibold py-3 rounded-xl">
              Sign out
            </button>
            <button (click)="showLogoutConfirm.set(false)" class="btn-secondary">Cancel</button>
          </div>
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService    = inject(AuthService);
  private workoutService = inject(WorkoutService);

  readonly user = this.authService.user;
  readonly showLogoutConfirm = signal(false);

  readonly totalWorkouts = signal(0);
  readonly totalSets     = signal(0);
  readonly streakDays    = signal(0);

  readonly initials = () => {
    const name = this.user()?.name ?? '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  ngOnInit(): void {
    // Load a page of history to compute basic stats
    this.workoutService.getHistory(1, 100).subscribe({
      next: (res) => {
        this.totalWorkouts.set(res.totalCount);
        const sets = res.items.reduce((sum, w) => sum + w.completedSets, 0);
        this.totalSets.set(sets);
        this.streakDays.set(this.calcStreak(res.items.map(w => w.startedAt)));
      }
    });
  }

  private themeService = inject(ThemeService);
  readonly theme = this.themeService.theme;

  private calcStreak(dates: string[]): number {
    if (!dates.length) return 0;
    const unique = [...new Set(dates.map(d => new Date(d).toDateString()))].map(d => new Date(d));
    unique.sort((a, b) => b.getTime() - a.getTime());
    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (const d of unique) {
      const dd = new Date(d); dd.setHours(0, 0, 0, 0);
      const diff = Math.round((cursor.getTime() - dd.getTime()) / 86_400_000);
      if (diff === 0 || diff === 1) { streak++; cursor = dd; }
      else break;
    }
    return streak;
  }

  confirmLogout(): void { this.showLogoutConfirm.set(true); }
  logout(): void { this.authService.logout(); }
}