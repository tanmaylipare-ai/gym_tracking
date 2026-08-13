import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WeightTrainingPointDto,
  TonnageEfficiencyPointDto,
  BodyweightPointDto,
  CardioPointDto,
  SessionCompositionPointDto,
  BandVolumePointDto,
} from '../models/models';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/api/analytics`;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private http = inject(HttpClient);

  private rangeParams(from?: Date, to?: Date): HttpParams {
    let params = new HttpParams();
    if (from) params = params.set('from', from.toISOString());
    if (to) params = params.set('to', to.toISOString());
    return params;
  }

  getWeightTraining(
    exerciseId: string,
    from?: Date,
    to?: Date,
  ): Observable<WeightTrainingPointDto[]> {
    return this.http.get<WeightTrainingPointDto[]>(
      `${API}/weight-training/${exerciseId}`,
      { params: this.rangeParams(from, to) },
    );
  }

  getTonnageEfficiency(from?: Date, to?: Date): Observable<TonnageEfficiencyPointDto[]> {
    return this.http.get<TonnageEfficiencyPointDto[]>(
      `${API}/weight-training/tonnage-efficiency`,
      { params: this.rangeParams(from, to) },
    );
  }

  getBodyweight(
    exerciseId: string,
    from?: Date,
    to?: Date,
  ): Observable<BodyweightPointDto[]> {
    return this.http.get<BodyweightPointDto[]>(
      `${API}/bodyweight/${exerciseId}`,
      { params: this.rangeParams(from, to) },
    );
  }

  getCardio(exerciseId: string, from?: Date, to?: Date): Observable<CardioPointDto[]> {
    return this.http.get<CardioPointDto[]>(
      `${API}/cardio/${exerciseId}`,
      { params: this.rangeParams(from, to) },
    );
  }

  getSessionComposition(
    from?: Date,
    to?: Date,
  ): Observable<SessionCompositionPointDto[]> {
    return this.http.get<SessionCompositionPointDto[]>(
      `${API}/session-composition`,
      { params: this.rangeParams(from, to) },
    );
  }

  getBandTraining(
    exerciseId: string,
    from?: Date,
    to?: Date,
  ): Observable<BandVolumePointDto[]> {
    return this.http.get<BandVolumePointDto[]>(
      `${API}/band-training/${exerciseId}`,
      { params: this.rangeParams(from, to) },
    );
  }
}