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

// export interface ExerciseDto {
//   id: string;
//   name: string;
//   category: string;
//   muscleGroup: string;
//   description?: string;
//   isCustom: boolean;
//   createdAt: string;
// }

export interface ExerciseDto {
  id: string;
  name: string;
  category: string;
  muscleGroup: string;
  secondaryMuscleGroup: string | null;
  equipment: string;
  description: string | null;
  isCustom: boolean;
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
  reps: number;
  weight: number;
  weightUnit: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface WorkoutExerciseDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
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
  reps: number;
  weight: number;
  weightUnit: string;
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
