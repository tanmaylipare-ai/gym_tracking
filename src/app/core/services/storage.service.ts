import { Injectable } from '@angular/core';
import { UserProfileDto, WorkoutDto } from '../models/models';

const KEYS = {
  AUTH_TOKEN:      'auth_token',
  REFRESH_TOKEN:   'refresh_token',
  TOKEN_EXPIRES:   'token_expires_at',
  USER_PROFILE:    'user_profile',
  ACTIVE_WORKOUT:  'active_workout',
  CLIENT_VERSION:  'client_version',
} as const;

@Injectable({ providedIn: 'root' })
export class StorageService {

  // ── Auth tokens ─────────────────────────────────────────────────────────────

  setTokens(accessToken: string, refreshToken: string, expiresAt: string): void {
    localStorage.setItem(KEYS.AUTH_TOKEN,    accessToken);
    localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(KEYS.TOKEN_EXPIRES, expiresAt);
  }

  getAccessToken(): string | null  { return localStorage.getItem(KEYS.AUTH_TOKEN); }
  getRefreshToken(): string | null { return localStorage.getItem(KEYS.REFRESH_TOKEN); }
  getTokenExpiry(): string | null  { return localStorage.getItem(KEYS.TOKEN_EXPIRES); }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiry();
    if (!exp) return true;
    return new Date(exp) <= new Date();
  }

  // ── User profile ─────────────────────────────────────────────────────────────

  setUserProfile(user: UserProfileDto): void {
    localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(user));
  }

  getUserProfile(): UserProfileDto | null {
    const raw = localStorage.getItem(KEYS.USER_PROFILE);
    return raw ? JSON.parse(raw) : null;
  }

  // ── Active workout ────────────────────────────────────────────────────────────

  setActiveWorkout(workout: WorkoutDto): void {
    localStorage.setItem(KEYS.ACTIVE_WORKOUT, JSON.stringify(workout));
  }

  getActiveWorkout(): WorkoutDto | null {
    const raw = localStorage.getItem(KEYS.ACTIVE_WORKOUT);
    return raw ? JSON.parse(raw) : null;
  }

  clearActiveWorkout(): void {
    localStorage.removeItem(KEYS.ACTIVE_WORKOUT);
    localStorage.removeItem(KEYS.CLIENT_VERSION);
  }

  // ── Client version (sync counter) ────────────────────────────────────────────

  getClientVersion(): number {
    return parseInt(localStorage.getItem(KEYS.CLIENT_VERSION) ?? '0', 10);
  }

  incrementClientVersion(): number {
    const next = this.getClientVersion() + 1;
    localStorage.setItem(KEYS.CLIENT_VERSION, String(next));
    return next;
  }

  // ── Full clear (logout) ────────────────────────────────────────────────────────

  clearAll(): void {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }
}
