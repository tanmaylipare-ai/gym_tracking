import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

function passwordMatch(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('password');
  const pw2 = control.get('confirmPassword');
  if (!pw || !pw2) return null;
  return pw.value === pw2.value ? null : { mismatch: true };
}

@Component({
    selector: 'app-register',
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    template: `
    <div class="min-h-screen bg-gym-bg flex flex-col justify-center px-6 safe-top safe-bottom">
      <div class="w-full max-w-md mx-auto">

      <!-- Brand -->
      <div class="mb-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gym-accent mb-4">
          <svg class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h3m15 0h-3M3 12h18M6 6v12M18 6v12M9 18h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold">Create account</h1>
        <p class="text-gym-muted mt-1 text-sm">Start building your fitness history.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

        <div>
          <label class="block text-sm font-medium text-gym-muted mb-2">Name</label>
          <input type="text" formControlName="name" placeholder="Your name"
                 autocomplete="name" class="input-field"/>
          @if (form.get('name')?.invalid && form.get('name')?.touched) {
            <p class="text-gym-accent text-xs mt-1.5">Name is required.</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-gym-muted mb-2">Email</label>
          <input type="email" formControlName="email" placeholder="you@example.com"
                 autocomplete="email" class="input-field"/>
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <p class="text-gym-accent text-xs mt-1.5">Enter a valid email address.</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-gym-muted mb-2">Password</label>
          <input type="password" formControlName="password" placeholder="Min. 8 characters"
                 autocomplete="new-password" class="input-field"/>
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
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
              Creating account…
            </span>
          } @else {
            Create account
          }
        </button>
      </form>

      <p class="text-center text-gym-muted text-sm mt-8">
        Already have an account?
        <a routerLink="/login" class="text-gym-accent font-medium ml-1">Sign in</a>
      </p>
      </div> <!-- max-width container -->
    </div>
  `
})
export class RegisterComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private fb     = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error   = signal('');

  form = this.fb.group({
    name:            ['', Validators.required],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordMatch });

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    const { email, password, name } = this.form.value;
    this.auth.register(email!, password!, name!).subscribe({
      next: () => this.router.navigate(['/workout']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      }
    });
  }
}
