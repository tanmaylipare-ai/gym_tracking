import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoutineDto } from '../models/models';
import { environment } from '../../../environments/environment';

// const API = 'http://localhost:5000/api/routines';
const API = `${environment.apiUrl}/api/routines`;

export interface CreateRoutinePayload {
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    order: number;
    defaultSets: number;
    defaultReps: number;
    defaultWeight?: number;
    notes?: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class RoutineService {
  private http = inject(HttpClient);

  getAll(): Observable<RoutineDto[]> {
    return this.http.get<RoutineDto[]>(API);
  }

  getById(id: string): Observable<RoutineDto> {
    return this.http.get<RoutineDto>(`${API}/${id}`);
  }

  create(payload: CreateRoutinePayload): Observable<RoutineDto> {
    return this.http.post<RoutineDto>(API, payload);
  }

  update(id: string, payload: Partial<CreateRoutinePayload>): Observable<RoutineDto> {
    return this.http.put<RoutineDto>(`${API}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
