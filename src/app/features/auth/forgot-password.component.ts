import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="min-h-screen bg-gym-bg flex flex-col justify-center px-6 safe-top safe-bottom">
      <div class="w-full max-w-md mx-auto">

      <div class="mb-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gym-accent mb-4">
          <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h3m15 0h-3M3 12h18M6 6v12M18 6v12M9 18h6"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold">Forgot password?</h1>
        <p class="text-gym-muted mt-1 text-sm">Enter your email and we'll send a reset link.</p>
      </div>

      @if (successMessage()) {
        <div class="bg-gym-success/10 border border-gym-success/30 rounded-xl px-4 py-4 mb-6 text-center">
          <p class="text-gym-success text-sm font-medium">{{ successMessage() }}</p>
        </div>
        <a routerLink="/login" class="btn-primary text-center block">Back to sign in</a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gym-muted mb-2">Email</label>
            <input type="email" formControlName="email" placeholder="you@example.com"
                   autocomplete="email" class="input-field"/>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <p class="text-gym-accent text-xs mt-1.5">Enter a valid email address.</p>
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
                Sending…
              </span>
            } @else {
              Send reset link
            }
          </button>
        </form>

        <p class="text-center text-gym-muted text-sm mt-8">
          Remember it?
          <a routerLink="/login" class="text-gym-accent font-medium ml-1">Sign in</a>
        </p>
      }
      </div><!-- max width container -->
    </div>
  `
})
export class ForgotPasswordComponent {
  private auth = inject(AuthService);
  private fb   = inject(FormBuilder);

  readonly loading        = signal(false);
  readonly error          = signal('');
  readonly successMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Something went wrong. Please try again.');
        this.loading.set(false);
      }
    });
  }
}