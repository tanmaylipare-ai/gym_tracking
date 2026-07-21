import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pw  = control.get('newPassword');
  const pw2 = control.get('confirmPassword');
  if (!pw || !pw2) return null;
  return pw.value === pw2.value ? null : { mismatch: true };
}

@Component({
    selector: 'app-reset-password',
    imports: [ReactiveFormsModule, RouterLink],
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
        <h1 class="text-3xl font-bold">Reset password</h1>
      </div>

      <!-- No token in URL -->
      @if (!token) {
        <div class="bg-gym-accent/10 border border-gym-accent/30 rounded-xl px-4 py-4 text-center mb-6">
          <p class="text-gym-accent font-medium">Invalid reset link.</p>
          <p class="text-gym-muted text-sm mt-1">This link is missing a reset token.</p>
        </div>
        <a routerLink="/forgot-password" class="btn-primary text-center block">Request a new link</a>
      }

      <!-- Success state -->
      @else if (successMessage()) {
        <div class="bg-gym-success/10 border border-gym-success/30 rounded-xl px-4 py-4 text-center mb-6">
          <p class="text-gym-success font-medium">{{ successMessage() }}</p>
          <p class="text-gym-muted text-sm mt-1">You can now sign in with your new password.</p>
        </div>
        <a routerLink="/login" class="btn-primary text-center block">Sign in</a>
      }

      <!-- Form -->
      @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

          <div>
            <label class="block text-sm font-medium text-gym-muted mb-2">New password</label>
            <input type="password" formControlName="newPassword" placeholder="Min. 8 characters"
                   autocomplete="new-password" class="input-field"/>
            @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
              <p class="text-gym-accent text-xs mt-1.5">Password must be at least 8 characters.</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gym-muted mb-2">Confirm password</label>
            <input type="password" formControlName="confirmPassword" placeholder="Repeat password"
                   autocomplete="new-password" class="input-field"/>
            @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
              <p class="text-gym-accent text-xs mt-1.5">Passwords do not match.</p>
            }
          </div>

          <!-- Token invalid / expired error -->
          @if (error()) {
            <div class="bg-gym-accent/10 border border-gym-accent/30 rounded-xl px-4 py-3">
              <p class="text-gym-accent text-sm">{{ error() }}</p>
              @if (showRequestNewLink()) {
                <a routerLink="/forgot-password"
                   class="text-gym-accent font-semibold text-sm underline mt-2 block">
                  Request a new reset link
                </a>
              }
            </div>
          }

          <button type="submit" [disabled]="loading() || form.invalid" class="btn-primary mt-2">
            @if (loading()) {
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Resetting…
              </span>
            } @else {
              Reset password
            }
          </button>
        </form>

        <p class="text-center text-gym-muted text-sm mt-8">
          <a routerLink="/login" class="text-gym-accent font-medium">Back to sign in</a>
        </p>
      }
    </div> <!-- max width container -->
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  private auth  = inject(AuthService);
  private route = inject(ActivatedRoute);
  private fb    = inject(FormBuilder);

  // Token is kept only in runtime memory — never written to localStorage/sessionStorage
  token: string | null = null;

  readonly loading          = signal(false);
  readonly error            = signal('');
  readonly successMessage   = signal('');
  readonly showRequestNewLink = signal(false);

  form = this.fb.group({
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  onSubmit(): void {
    if (this.form.invalid || !this.token) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.showRequestNewLink.set(false);

    this.auth.resetPassword(this.token, this.form.value.newPassword!).subscribe({
      next: (res) => {
        this.successMessage.set(res.message);
        this.loading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Something went wrong. Please try again.';
        this.error.set(msg);
        // Show "request new link" when the token itself is the problem
        if (err?.status === 400) this.showRequestNewLink.set(true);
        this.loading.set(false);
      }
    });
  }
}