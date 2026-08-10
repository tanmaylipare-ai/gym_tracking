import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { AuthResponse, MessageResponse, UserProfileDto } from '../models/models';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

// const API = 'http://localhost:5000/api/auth';
const API = `${environment.apiUrl}/api/auth`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storage = inject(StorageService);

  private _user = signal<UserProfileDto | null>(this.storage.getUserProfile());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._user());

  // ── Register ────────────────────────────────────────────────────────────────

  register(
    email: string,
    password: string,
    name: string,
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API}/register`, { email, password, name })
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  // ── Login ────────────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API}/login`, { email, password })
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  // ── Refresh ──────────────────────────────────────────────────────────────────

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.storage.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token'));

    return this.http
      .post<AuthResponse>(`${API}/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.handleAuthResponse(res)),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  // ── Me ────────────────────────────────────────────────────────────────────────

  me(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${API}/me`).pipe(
      tap((user) => {
        this._user.set(user);
        this.storage.setUserProfile(user);
      }),
    );
  }

  // ── Forgot password ───────────────────────────────────────────────────────────

  forgotPassword(email: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${API}/forgot-password`, { email });
  }

  // ── Reset password ────────────────────────────────────────────────────────────

  resetPassword(
    token: string,
    newPassword: string,
  ): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${API}/reset-password`, {
      token,
      newPassword,
    });
  }

  // ── Logout ────────────────────────────────────────────────────────────────────

  logout(): void {
    const refreshToken = this.storage.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(`${API}/logout`, { refreshToken })
        .subscribe({ error: () => {} });
    }
    this.storage.clearAll();
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  // ── Private helpers ────────────────────────────────────────────────────────────

  private handleAuthResponse(res: AuthResponse): void {
    this.storage.setTokens(res.accessToken, res.refreshToken, res.expiresAt);
    this.storage.setUserProfile(res.user);
    this._user.set(res.user);
  }

  // ── Health Check (Wake-up ping for Render) ──────────────────────────
  ping(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/health`);
  }
}
