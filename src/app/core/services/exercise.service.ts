import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExerciseDto } from '../models/models';

const API = 'http://localhost:5000/api/exercises';

@Injectable({ providedIn: 'root' })
export class ExerciseService {
  private http = inject(HttpClient);

  getAll(): Observable<ExerciseDto[]> {
    return this.http.get<ExerciseDto[]>(API);
  }

  create(payload: { name: string; category: string; muscleGroup: string; description?: string }): Observable<ExerciseDto> {
    return this.http.post<ExerciseDto>(API, payload);
  }

  update(id: string, payload: Partial<ExerciseDto>): Observable<ExerciseDto> {
    return this.http.put<ExerciseDto>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
