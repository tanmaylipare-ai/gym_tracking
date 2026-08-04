import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, throwError } from 'rxjs';
import { WorkoutDto, WorkoutSummaryDto, PaginatedResponse } from '../models/models';
import { StorageService } from './storage.service';
import { environment } from '../../../environments/environment';

// const API = 'http://localhost:5000/api/workouts';
const API = `${environment.apiUrl}/api/workouts`;

export interface SyncPayload {
  workoutId: string;
  draftData: string;
  clientVersion: number;
  exercises: WorkoutDto['exercises'];
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);

  // Active workout state — backed by localStorage
  private _activeWorkout = signal<WorkoutDto | null>(
    this.storage.getActiveWorkout(),
  );
  readonly activeWorkout = this._activeWorkout.asReadonly();

  private syncedExerciseIds = new Set<string>(
    (this.storage.getActiveWorkout()?.exercises ?? []).map((e) => e.id),
  );

  private trackServerState(w: WorkoutDto): void {
    this.storage.setActiveWorkout(w);
    this._activeWorkout.set(w);
    this.syncedExerciseIds = new Set(w.exercises.map((e) => e.id));
  }

  // ── Start ────────────────────────────────────────────────────────────────────

  start(name: string, routineId?: string): Observable<WorkoutDto> {
    return this.http.post<WorkoutDto>(`${API}/start`, { name, routineId }).pipe(
      tap((w) => {
        // this.storage.setActiveWorkout(w);
        // this._activeWorkout.set(w);
        this.trackServerState(w);
        this.storage.incrementClientVersion();
      }),
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
      tap((w) => this.trackServerState(w)),
      // tap((w) => {
      //   this.storage.setActiveWorkout(w);
      //   this._activeWorkout.set(w);
      // }),
    );
  }

  // ── Reorder ──────────────────────────────────────────────────────────────

  /**
   * Persists a new exercise order immediately (not deferred to periodic sync)
   * so a drag-and-drop survives a refresh/crash. If any exercise in the list
   * hasn't been confirmed by the server yet, a full sync is used instead —
   * SyncWorkoutAsync writes the Order field for every exercise it upserts
   * (including brand-new ones), so it achieves the reorder on its own.
   */
  reorderExercises(exerciseOrder: string[]): Observable<WorkoutDto> {
    const w = this._activeWorkout();
    if (!w) return throwError(() => new Error('No active workout'));

    const hasUnsynced = exerciseOrder.some(
      (id) => !this.syncedExerciseIds.has(id),
    );
    if (hasUnsynced) {
      return this.sync(w.id, w);
    }

    return this.http
      .put<WorkoutDto>(`${API}/${w.id}/exercises/reorder`, { exerciseOrder })
      .pipe(tap((updated) => this.trackServerState(updated)));
  }

  // ── Delete exercise ──────────────────────────────────────────────────────

  /**
   * Removes an exercise from the active workout. If it was only ever created
   * locally (never synced), it's removed purely client-side — there's
   * nothing on the server to delete yet. Otherwise the dedicated delete
   * endpoint is called immediately.
   */
  deleteExercise(exerciseId: string): Observable<WorkoutDto> {
    const w = this._activeWorkout();
    if (!w) return throwError(() => new Error('No active workout'));

    if (!this.syncedExerciseIds.has(exerciseId)) {
      const updated: WorkoutDto = {
        ...w,
        exercises: w.exercises.filter((e) => e.id !== exerciseId),
      };
      this.trackServerState(updated);
      return of(updated);
    }

    return this.http
      .delete<WorkoutDto>(`${API}/${w.id}/exercises/${exerciseId}`)
      .pipe(tap((updated) => this.trackServerState(updated)));
  }

  // ── Finish ────────────────────────────────────────────────────────────────────

  finish(workoutId: string, notes?: string): Observable<WorkoutDto> {
    return this.http
      .post<WorkoutDto>(`${API}/${workoutId}/finish`, { notes })
      .pipe(
        tap(() => {
          this.storage.clearActiveWorkout();
          this._activeWorkout.set(null);
          this.syncedExerciseIds.clear();
        }),
      );
  }

  // ── Cancel / delete ────────────────────────────────────────────────────────────

  cancel(workoutId: string): Observable<void> {
    return this.http.delete<void>(`${API}/${workoutId}`).pipe(
      tap(() => {
        this.storage.clearActiveWorkout();
        this._activeWorkout.set(null);
        this.syncedExerciseIds.clear();
      }),
    );
  }

  // ── History ────────────────────────────────────────────────────────────────────

  getHistory(
    page = 1,
    pageSize = 20,
  ): Observable<PaginatedResponse<WorkoutSummaryDto>> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PaginatedResponse<WorkoutSummaryDto>>(API, { params });
  }

  getById(id: string): Observable<WorkoutDto> {
    return this.http.get<WorkoutDto>(`${API}/${id}`);
  }

  getActive(): Observable<WorkoutDto> {
    return this.http.get<WorkoutDto>(`${API}/active`).pipe(
      tap(w => this.trackServerState(w))
    );
  }

  // ── Local-only mutators (update signal + storage without HTTP) ─────────────────

  updateLocalWorkout(workout: WorkoutDto): void {
    this.storage.setActiveWorkout(workout);
    this._activeWorkout.set({ ...workout });
  }
}
