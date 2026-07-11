import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { WorkoutDto, WorkoutSummaryDto, PaginatedResponse } from '../models/models';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

// const API = 'http://localhost:5000/api/workouts';
const API = `${environment.apiUrl}/api/auth`;

export interface SyncPayload {
  workoutId: string;
  draftData: string;
  clientVersion: number;
  exercises: WorkoutDto['exercises'];
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private http    = inject(HttpClient);
  private storage = inject(StorageService);

  // Active workout state — backed by localStorage
  private _activeWorkout = signal<WorkoutDto | null>(this.storage.getActiveWorkout());
  readonly activeWorkout = this._activeWorkout.asReadonly();

  // ── Start ────────────────────────────────────────────────────────────────────

  start(name: string, routineId?: string): Observable<WorkoutDto> {
    return this.http.post<WorkoutDto>(`${API}/start`, { name, routineId }).pipe(
      tap(w => {
        this.storage.setActiveWorkout(w);
        this._activeWorkout.set(w);
        this.storage.incrementClientVersion();
      })
    );
  }

  // ── Sync ─────────────────────────────────────────────────────────────────────

  sync(workoutId: string, workout: WorkoutDto): Observable<WorkoutDto> {
    const clientVersion = this.storage.incrementClientVersion();
    const payload: SyncPayload = {
      workoutId,
      draftData: JSON.stringify(workout),
      clientVersion,
      exercises: workout.exercises,
    };
    return this.http.post<WorkoutDto>(`${API}/${workoutId}/sync`, payload).pipe(
      tap(w => {
        this.storage.setActiveWorkout(w);
        this._activeWorkout.set(w);
      })
    );
  }

  // ── Finish ────────────────────────────────────────────────────────────────────

  finish(workoutId: string, notes?: string): Observable<WorkoutDto> {
    return this.http.post<WorkoutDto>(`${API}/${workoutId}/finish`, { notes }).pipe(
      tap(() => {
        this.storage.clearActiveWorkout();
        this._activeWorkout.set(null);
      })
    );
  }

  // ── Cancel / delete ────────────────────────────────────────────────────────────

  cancel(workoutId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${workoutId}`).pipe(
      tap(() => {
        this.storage.clearActiveWorkout();
        this._activeWorkout.set(null);
      })
    );
  }

  // ── History ────────────────────────────────────────────────────────────────────

  getHistory(page = 1, pageSize = 20): Observable<PaginatedResponse<WorkoutSummaryDto>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginatedResponse<WorkoutSummaryDto>>(API, { params });
  }

  getById(id: string): Observable<WorkoutDto> {
    return this.http.get<WorkoutDto>(`${API}/${id}`);
  }

  getActive(): Observable<WorkoutDto> {
    return this.http.get<WorkoutDto>(`${API}/active`);
  }

  // ── Local-only mutators (update signal + storage without HTTP) ─────────────────

  updateLocalWorkout(workout: WorkoutDto): void {
    this.storage.setActiveWorkout(workout);
    this._activeWorkout.set({ ...workout });
  }
}
