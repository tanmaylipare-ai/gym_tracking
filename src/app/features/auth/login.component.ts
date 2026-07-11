import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gym-bg flex flex-col justify-center px-6 safe-top safe-bottom">

      <!-- Logo / brand -->
      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gym-accent mb-4">
          <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h3m15 0h-3M3 12h18M6 6v12M18 6v12M9 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold tracking-tight">GymTracker</h1>
        <p class="text-gym-muted mt-1 text-sm">Track every rep. Own your progress.</p>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gym-muted mb-2">Email</label>
          <input
            type="email"
            formControlName="email"
            placeholder="you@example.com"
            autocomplete="email"
            class="input-field"
          />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <p class="text-gym-accent text-xs mt-1.5">Enter a valid email address.</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-gym-muted mb-2">Password</label>
          <div class="relative">
            <input
              [type]="showPassword() ? 'text' : 'password'"
              formControlName="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="input-field pr-12"
            />
            <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gym-muted">
              @if (showPassword()) {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23" stroke-linecap="round"/>
                </svg>
              } @else {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              }
            </button>
            <br><br>
          </div>
          <a routerLink="/forgot-password" class="text-xs text-gym-accent font-medium">Forgot password?</a>          
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <p class="text-gym-accent text-xs mt-1.5">Password is required.</p>
          }
        </div>

        @if (error()) {
          <div class="bg-gym-accent/10 border border-gym-accent/30 rounded-xl px-4 py-3">
            <p class="text-gym-accent text-sm">{{ error() }}</p>
          </div>
        }

        <button type="submit" [disabled]="loading() || form.invalid" class="btn-primary mt-2">
          @if (loading()) {
            <span class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Signing in…
            </span>
          } @else {
            Sign in
          }
        </button>
      </form>

      <!-- Footer link -->
      <p class="text-center text-gym-muted text-sm mt-8">
        No account?
        <a routerLink="/register" class="text-gym-accent font-medium ml-1">Create one</a>
      </p>
    </div>
  `
})
export class LoginComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  readonly showPassword = signal(false);
  readonly loading      = signal(false);
  readonly error        = signal('');

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/workout']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Invalid email or password.');
        this.loading.set(false);
      }
    });
  }
}
