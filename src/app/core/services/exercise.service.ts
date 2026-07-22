import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExerciseDto } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/exercises`;

  private exercises$?: Observable<ExerciseDto[]>;
  private readonly exerciseCache = new Map<string, ExerciseDto>();

  getAll(): Observable<ExerciseDto[]> {
    if (!this.exercises$) {
      this.exercises$ = this.http.get<ExerciseDto[]>(this.baseUrl).pipe(
        tap(list => list.forEach(e => this.exerciseCache.set(e.id, e))),
        shareReplay(1)
      );
    }
    return this.exercises$;
  }

  getById(id: string): Observable<ExerciseDto> {
    const cached = this.exerciseCache.get(id);
    if (cached) {
      return of(cached);
    }
    return this.http.get<ExerciseDto>(`${this.baseUrl}/${id}`).pipe(
      tap(e => this.exerciseCache.set(e.id, e))
    );
  }

  /** Prepend the API origin to a relative media path returned by the backend */
  mediaUrl(path: string | null): string | null {
    return path ? `${environment.apiUrl}${path}` : null;
  }

  /** Call after creating/editing a custom exercise so the next getAll() re-fetches */
  invalidateCache(): void {
    this.exercises$ = undefined;
    this.exerciseCache.clear();
  }
}