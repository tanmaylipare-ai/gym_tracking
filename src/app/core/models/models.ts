export interface UserProfileDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfileDto;
}

export type ExerciseType = 'WeightTraining' | 'Bodyweight' | 'Cardio' | 'BandTraining';

export interface ExerciseDto {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  secondaryMuscleGroup: string | null;
  equipment: string;
  description: string | null;
  isCustom: boolean;
  exerciseType: ExerciseType;
  createdAt: string;
  thumbnailUrl: string | null;
  videoUrl: string | null;
}

export interface RoutineExerciseDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  order: number;
  defaultSets: number;
  defaultReps: number;
  defaultWeight?: number;
  notes: string;
}

export interface RoutineDto {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExerciseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSetDto {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  weightUnit: string | null;
  isWarmup: boolean;
  durationSeconds: number | null;
  distance: number | null;
  distanceUnit: string | null;
  bandLevel: string | null;
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutExerciseDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  exerciseType: ExerciseType;
  order: number;
  notes?: string;
  sets: WorkoutSetDto[];
}

export interface WorkoutDto {
  id: string;
  name: string;
  routineId?: string;
  status: 'InProgress' | 'Completed' | 'Cancelled';
  startedAt: string;
  finishedAt: string | null;
  notes?: string;
  exercises: WorkoutExerciseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSummaryDto {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  finishedAt?: string;
  totalExercises: number;
  totalSets: number;
  completedSets: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface MessageResponse {
  message: string;
}
 
export interface ForgotPasswordRequest {
  email: string;
}
 
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
 
// ── Sync request shapes (must match backend SyncWorkoutRequest exactly) ────────
 
export interface SyncSetDto {
  id: string | null;        // nullable uuid — null for client-created sets not yet persisted
  setNumber: number;
  reps: number | null;
  weight: number | null;
  weightUnit: string | null;
  isWarmup: boolean;
  durationSeconds: number | null;
  distance: number | null;
  distanceUnit: string | null;
  bandLevel: string | null;
  isCompleted: boolean;
  completedAt: string | null;
}
 
export interface SyncExerciseDto {
  id: string | null;        // nullable uuid — null for client-created exercises
  exerciseId: string;
  order: number;
  notes: string | null;
  sets: SyncSetDto[];
}

// ── Analytics response shapes (must match backend AnalyticsDtos.cs exactly) ────
// DateOnly serializes as "YYYY-MM-DD".

export interface WeightTrainingPointDto {
  date: string;
  topSetWeightKg: number;
  topSetReps: number;
  e1RM: number;
  heaviestSetKg: number;
  averageWorkingWeightKg: number | null;
}

export interface TonnageEfficiencyPointDto {
  date: string;
  totalTonnageKg: number;
  sessionMinutes: number;
  tonnagePerMinute: number;
}

export interface BodyweightPointDto {
  date: string;
  totalSets: number;
  totalReps: number;
  volume: number;
  maxRepsInSingleSet: number;
}

export interface CardioPointDto {
  date: string;
  durationSeconds: number;
  distanceKm: number | null;
  paceSecPerKm: number | null;
  strokesOrStrides: number | null;
  ratePerMin: number | null;
}

export interface SessionCompositionPointDto {
  weekStart: string;
  cardioMinutes: number;
  strengthMinutes: number;
  cardioRatioPercent: number;
}

export interface BandVolumePointDto {
  date: string;
  virtualVolumeKg: number;
  weightTrainingVolumeKg: number;
}