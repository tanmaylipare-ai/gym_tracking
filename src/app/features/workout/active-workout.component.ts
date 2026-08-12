import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutDto, WorkoutExerciseDto, WorkoutSetDto, ExerciseDto, ExerciseType } from '../../core/models/models';
import { ExercisePickerComponent } from './exercise-picker.component';
import {
  CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragDrop, moveItemInArray
} from '@angular/cdk/drag-drop';
import { catchError, of, switchMap } from 'rxjs';

const BAND_LEVELS = ['Light', 'Medium', 'Heavy', 'X-Heavy'];

@Component({
  selector: 'app-active-workout',
  imports: [
    CommonModule,
    FormsModule,
    ExercisePickerComponent,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
  ],
  template: `
    <div class="flex flex-col min-h-screen bg-gym-bg pb-24 safe-top relative">
      <!-- Top Toast Banner for General Errors -->
      @if (errorMessage() && !showFinishConfirm()) {
        <div class="fixed top-16 left-4 right-4 z-40 bg-red-500/90 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center justify-between backdrop-blur animate-fade-in">
          <span>{{ errorMessage() }}</span>
          <button (click)="errorMessage.set(null)" class="text-white/80 hover:text-white p-1">
            ✕
          </button>
        </div>
      }

      <!-- Sticky header -->
      <div
        class="sticky top-0 z-30 bg-gym-bg/95 backdrop-blur border-b border-gym-border px-4 pt-4 pb-3"
      >
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold">
              {{ workout()?.name ?? 'Workout' }}
            </h1>
            <p class="text-xs text-gym-muted mt-0.5">{{ elapsedStr() }}</p>
          </div>
          <div class="flex gap-2">
            <button
              (click)="showCancelConfirm.set(true)"
              class="text-gym-muted text-sm px-3 py-1.5 rounded-lg border border-gym-border"
            >
              Cancel
            </button>
            <button
              (click)="confirmFinish()"
              class="bg-gym-success text-gym-bg text-sm font-bold px-4 py-1.5 rounded-lg"
            >
              Finish
            </button>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div
        class="px-4 pt-4 space-y-4"
        cdkDropList
        (cdkDropListDropped)="onExerciseDrop($event)"
      >
        @for (
          ex of workout()?.exercises ?? [];
          track ex.id;
          let exIdx = $index
        ) {
          <div class="card rounded-2xl overflow-hidden" cdkDrag>
            <div
              *cdkDragPlaceholder
              class="rounded-2xl border-2 border-dashed border-gym-border h-20 mb-4"
            ></div>
            <!-- Exercise header -->
            <div
              class="flex items-center justify-between px-4 py-3 border-b border-gym-border"
            >
              <div class="flex items-center gap-2">
                <span
                  cdkDragHandle
                  class="text-gym-muted p-1 -ml-1 cursor-grab active:cursor-grabbing touch-none"
                  aria-label="Drag to reorder"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="8" cy="6" r="1.5" />
                    <circle cx="8" cy="12" r="1.5" />
                    <circle cx="8" cy="18" r="1.5" />
                    <circle cx="16" cy="6" r="1.5" />
                    <circle cx="16" cy="12" r="1.5" />
                    <circle cx="16" cy="18" r="1.5" />
                  </svg>
                </span>
                <div>
                  <p class="font-bold">{{ ex.exerciseName }}</p>
                  <p class="text-xs text-gym-muted mt-0.5">
                    {{ ex.exerciseCategory }}
                  </p>
                </div>
              </div>
              <button
                (click)="removeExercise(exIdx)"
                class="text-gym-muted p-1.5"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <!-- Set column headers (per exercise type) -->
            <div
              class="grid gap-2 px-4 py-2 text-[10px] font-bold text-gym-muted uppercase tracking-wider"
              [style.grid-template-columns]="
                gridTemplateColumns(ex.exerciseType)
              "
            >
              <span class="text-center">SET</span>
              @for (header of columnHeaders(ex.exerciseType); track header) {
                <span [class.text-center]="header !== 'PREVIOUS'">{{
                  header
                }}</span>
              }
              <span></span>
            </div>

            <!-- Set rows -->
            @for (set of ex.sets; track set.id; let setIdx = $index) {
              <div
                class="grid gap-2 items-center px-4 py-2 transition-colors"
                [style.grid-template-columns]="
                  gridTemplateColumns(ex.exerciseType)
                "
                [class.bg-gym-success/10]="set.isCompleted"
              >
                <!-- Set number -->
                <span
                  class="text-center text-sm font-bold"
                  [class.text-gym-success]="set.isCompleted"
                  [class.text-gym-muted]="!set.isCompleted"
                >
                  {{ set.setNumber }}
                </span>

                <!-- Previous (placeholder) -->
                <span class="text-xs text-gym-muted truncate">—</span>

                @switch (ex.exerciseType) {
                  @case ('WeightTraining') {
                    <input
                      type="number"
                      [(ngModel)]="set.weight"
                      (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0"
                      placeholder="kg"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                    <input
                      type="number"
                      [(ngModel)]="set.reps"
                      (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0"
                      placeholder="reps"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                  @case ('Bodyweight') {
                    <input
                      type="number"
                      [(ngModel)]="set.reps"
                      (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0"
                      placeholder="reps"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                  @case ('Cardio') {
                    <input
                      type="text"
                      inputmode="numeric"
                      [value]="formatDuration(set.durationSeconds)"
                      (change)="onDurationChanged(exIdx, setIdx, $event)"
                      placeholder="mm:ss"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                    <input
                      type="number"
                      [(ngModel)]="set.distance"
                      (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0"
                      step="0.1"
                      placeholder="km"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                  @case ('BandTraining') {
                    <select
                      [(ngModel)]="set.bandLevel"
                      (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      class="w-full text-center text-xs font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    >
                      @for (level of bandLevels; track level) {
                        <option [value]="level">{{ level }}</option>
                      }
                    </select>
                    <input
                      type="number"
                      [(ngModel)]="set.reps"
                      (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0"
                      placeholder="reps"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }
                }

                <!-- Complete toggle -->
                <button
                  (click)="toggleSetComplete(exIdx, setIdx)"
                  class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                  [class.bg-gym-success]="set.isCompleted"
                  [class.bg-gym-surface]="!set.isCompleted"
                >
                  <svg
                    class="w-4 h-4"
                    [class.text-gym-bg]="set.isCompleted"
                    [class.text-gym-muted]="!set.isCompleted"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>

                <!-- Delete set -->
                <button
                  (click)="removeSet(exIdx, setIdx)"
                  class="flex items-center justify-center w-6 h-6 text-gym-muted"
                  aria-label="Remove set"
                >
                  <svg
                    class="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            }

            <!-- Add set button -->
            <button
              (click)="addSet(exIdx)"
              class="w-full py-3 text-sm font-semibold text-gym-accent border-t border-gym-border transition-opacity active:opacity-60"
            >
              + Add Set
            </button>
          </div>
        }

        <!-- Add exercise button -->
        <button
          (click)="showPicker.set(true)"
          class="w-full py-4 rounded-2xl border-2 border-dashed border-gym-border text-gym-accent font-semibold text-sm transition-colors active:border-gym-accent/60"
        >
          + Add Exercise
        </button>
        @if (dragError()) {
          <p class="text-xs text-red-500 text-center">{{ dragError() }}</p>
        }
      </div>

      <!-- Sync indicator -->
      @if (syncing()) {
        <div
          class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gym-surface text-xs text-gym-muted px-3 py-1.5 rounded-full border border-gym-border"
        >
          Syncing…
        </div>
      }

      <!-- Exercise picker overlay -->
      @if (showPicker()) {
        <app-exercise-picker
          (close)="showPicker.set(false)"
          (selected$)="onExercisesSelected($event)"
        />
      }

      <!-- Cancel confirm modal -->
      @if (showCancelConfirm()) {
        <div
          class="fixed inset-0 z-50 bg-black/60 flex items-center px-4 pb-8 safe-bottom"
          (click)="showCancelConfirm.set(false)"
        >
          <div
            class="w-full max-w-md mx-auto card rounded-2xl p-5 space-y-3"
            (click)="$event.stopPropagation()"
          >
            <h3 class="font-bold text-lg">Cancel workout?</h3>
            <p class="text-gym-muted text-sm">
              This workout will be deleted and cannot be recovered.
            </p>
            <button
              (click)="cancelWorkout()"
              class="w-full bg-gym-accent text-white font-semibold py-3 rounded-xl"
            >
              Yes, cancel workout
            </button>
            <button
              (click)="showCancelConfirm.set(false)"
              class="btn-secondary"
            >
              Keep going
            </button>
          </div>
        </div>
      }

      <!-- Finish confirm modal -->
      @if (showFinishConfirm()) {
        <div
          class="fixed inset-0 z-50 bg-black/60 flex items-center px-4 pb-8 safe-bottom"
          (click)="closeFinishConfirm()"
        >
          <div
            class="w-full max-w-md mx-auto card rounded-2xl p-5 space-y-3"
            (click)="$event.stopPropagation()"
          >
            <h3 class="font-bold text-lg">Finish workout?</h3>

            <p class="text-gym-muted text-sm">
              {{ completedSets() }} of {{ totalSets() }} sets completed.
            </p>

            <!-- Warning if 0 sets completed -->
            @if (completedSets() === 0) {
              <p class="text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                ⚠️ You must complete at least 1 set to finish this workout.
              </p>
            }

            <!-- Server Error Display -->
            @if (errorMessage()) {
              <p class="text-xs text-red-500 font-medium bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                {{ errorMessage() }}
              </p>
            }

            <textarea
              [(ngModel)]="finishNotes"
              placeholder="Optional notes…"
              rows="2"
              class="input-field resize-none"
            ></textarea>

            <button
              (click)="finishWorkout()"
              [disabled]="completedSets() === 0"
              class="w-full bg-gym-success text-gym-bg font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Finish workout
            </button>

            <button
              (click)="closeFinishConfirm()"
              class="btn-secondary w-full"
            >
              Back
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class ActiveWorkoutComponent implements OnInit, OnDestroy {
  private workoutService = inject(WorkoutService);
  private router = inject(Router);

  readonly workout = this.workoutService.activeWorkout;
  readonly showPicker = signal(false);
  readonly syncing = signal(false);
  readonly showCancelConfirm = signal(false);
  readonly showFinishConfirm = signal(false);

  readonly bandLevels = BAND_LEVELS;

  finishNotes = '';

  private startTime = Date.now();
  private elapsedTimer?: ReturnType<typeof setInterval>;
  private syncTimer?: ReturnType<typeof setInterval>;
  readonly elapsedSecs = signal(0);

  readonly elapsedStr = computed(() => {
    const s = this.elapsedSecs();
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0)
      return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  readonly totalSets = computed(() =>
    (this.workout()?.exercises ?? []).reduce(
      (sum, ex) => sum + ex.sets.length,
      0,
    ),
  );
  readonly dragError = signal<string | null>(null);
  readonly completedSets = computed(() =>
    (this.workout()?.exercises ?? []).reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
      0,
    ),
  );

  // Global error message signal
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (!this.workout()) {
      this.router.navigate(['/workout']);
      return;
    }
    const started = this.workout()?.startedAt;
    if (started) this.startTime = new Date(started).getTime();

    this.elapsedTimer = setInterval(() => {
      this.elapsedSecs.set(Math.floor((Date.now() - this.startTime) / 1000));
    }, 1000);

    this.syncTimer = setInterval(() => this.autoSync(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.elapsedTimer);
    clearInterval(this.syncTimer);
  }

  // ── Per-type layout helpers ───────────────────────────────────────────────────

  gridTemplateColumns(type: ExerciseType): string {
    switch (type) {
      case 'WeightTraining':
        return '2rem 1fr 4.5rem 4.5rem 2.5rem 2rem';
      case 'Bodyweight':
        return '2rem 1fr 4.5rem 2.5rem 2rem';
      case 'Cardio':
        return '2rem 1fr 5rem 5rem 2.5rem 2rem';
      case 'BandTraining':
        return '2rem 1fr 5.5rem 4.5rem 2.5rem 2rem';
      default:
        return '2rem 1fr 4.5rem 4.5rem 2.5rem 2rem';
    }
  }

  columnHeaders(type: ExerciseType): string[] {
    switch (type) {
      case 'WeightTraining':
        return ['PREVIOUS', 'KG', 'REPS'];
      case 'Bodyweight':
        return ['PREVIOUS', 'REPS'];
      case 'Cardio':
        return ['PREVIOUS', 'TIME', 'KM'];
      case 'BandTraining':
        return ['PREVIOUS', 'BAND', 'REPS'];
    }
  }

  formatDuration(totalSeconds: number | null): string {
    const s = totalSeconds ?? 0;
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  private parseDuration(value: string): number {
    const trimmed = value.trim();
    if (trimmed.includes(':')) {
      const [m, s] = trimmed.split(':').map((n) => parseInt(n, 10) || 0);
      return m * 60 + s;
    }
    return parseInt(trimmed, 10) || 0;
  }

  onDurationChanged(exIdx: number, setIdx: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const w = this.workout();
    if (!w) return;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    updated.exercises[exIdx].sets[setIdx].durationSeconds =
      this.parseDuration(value);
    this.workoutService.updateLocalWorkout(updated);
  }

  // ── Set operations ────────────────────────────────────────────────────────────

  onSetChanged(_exIdx: number, _setIdx: number): void {
    const w = this.workout();
    if (w) this.workoutService.updateLocalWorkout({ ...w });
  }

  toggleSetComplete(exIdx: number, setIdx: number): void {
    const w = this.workout();
    if (!w) return;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    const set = updated.exercises[exIdx].sets[setIdx];
    set.isCompleted = !set.isCompleted;
    set.completedAt = set.isCompleted ? new Date().toISOString() : undefined;
    this.workoutService.updateLocalWorkout(updated);
  }

  addSet(exIdx: number): void {
    const w = this.workout();
    if (!w) return;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    const ex = updated.exercises[exIdx];
    const lastSet = ex.sets[ex.sets.length - 1];
    const newSet = this.buildSet(ex.exerciseType, ex.sets.length + 1, lastSet);
    ex.sets.push(newSet);
    this.workoutService.updateLocalWorkout(updated);
  }

  removeSet(exIdx: number, setIdx: number): void {
    const w = this.workout();
    if (!w) return;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    const ex = updated.exercises[exIdx];

    ex.sets.splice(setIdx, 1);
    ex.sets.forEach((s, i) => (s.setNumber = i + 1));

    this.workoutService.updateLocalWorkout(updated);
  }

  removeExercise(exIdx: number): void {
    const w = this.workout();
    if (!w) return;
    const exercise = w.exercises[exIdx];
    const previous = w;

    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    updated.exercises.splice(exIdx, 1);
    this.dragError.set(null);
    this.workoutService.updateLocalWorkout(updated);

    this.workoutService.deleteExercise(exercise.id).subscribe({
      error: () => {
        this.dragError.set("Couldn't remove the exercise — please try again.");
        this.workoutService.updateLocalWorkout(previous);
      },
    });
  }

  private buildSet(
    type: ExerciseType,
    setNumber: number,
    previous?: WorkoutSetDto,
  ): WorkoutSetDto {
    const base: WorkoutSetDto = {
      id: crypto.randomUUID(),
      setNumber,
      reps: null,
      weight: null,
      weightUnit: null,
      durationSeconds: null,
      distance: null,
      distanceUnit: null,
      bandLevel: null,
      isCompleted: false,
    };

    switch (type) {
      case 'WeightTraining':
        return {
          ...base,
          reps: previous?.reps ?? 8,
          weight: previous?.weight ?? 0,
          weightUnit: 'kg',
        };
      case 'Bodyweight':
        return { ...base, reps: previous?.reps ?? 8 };
      case 'Cardio':
        return {
          ...base,
          durationSeconds: previous?.durationSeconds ?? 60,
          distance: previous?.distance ?? null,
          distanceUnit: 'km',
        };
      case 'BandTraining':
        return {
          ...base,
          reps: previous?.reps ?? 8,
          bandLevel: previous?.bandLevel ?? 'Medium',
        };
      default:
        return {
          ...base,
          reps: previous?.reps ?? 8,
          weight: previous?.weight ?? 0,
          weightUnit: 'kg',
        };
    }
  }

  // ── Exercise picker ───────────────────────────────────────────────────────────

  onExercisesSelected(exercises: ExerciseDto[]): void {
    this.showPicker.set(false);
    const w = this.workout();
    if (!w || !exercises.length) return;

    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    const nextOrder = updated.exercises.length;

    exercises.forEach((ex, i) => {
      updated.exercises.push({
        id: crypto.randomUUID(),
        exerciseId: ex.id,
        exerciseName: ex.name,
        exerciseCategory: ex.category,
        exerciseType: ex.exerciseType,
        order: nextOrder + i,
        sets: [this.buildSet(ex.exerciseType, 1)],
      });
    });
    this.workoutService.updateLocalWorkout(updated);
  }

  onExerciseDrop(event: CdkDragDrop<WorkoutExerciseDto[]>): void {
    const w = this.workout();
    if (!w || event.previousIndex === event.currentIndex) return;

    const previous = w;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    moveItemInArray(updated.exercises, event.previousIndex, event.currentIndex);
    updated.exercises.forEach((ex, i) => (ex.order = i));

    this.dragError.set(null);
    this.workoutService.updateLocalWorkout(updated);

    this.workoutService
      .reorderExercises(updated.exercises.map((ex) => ex.id))
      .subscribe({
        error: () => {
          this.dragError.set("Couldn't save the new order — please try again.");
          this.workoutService.updateLocalWorkout(previous);
        },
      });
  }

  // ── Finish / cancel ───────────────────────────────────────────────────────────

  confirmFinish(): void {
    this.errorMessage.set(null);
    this.showFinishConfirm.set(true);
  }

  closeFinishConfirm(): void {
    this.errorMessage.set(null);
    this.showFinishConfirm.set(false);
  }

  finishWorkout(): void {
    const w = this.workout();
    if (!w) return;

    if (this.completedSets() === 0) {
      this.errorMessage.set('Cannot finish workout without completing at least 1 set.');
      return;
    }

    this.errorMessage.set(null);

    this.workoutService
      .sync(w.id, w)
      .pipe(
        catchError((err) => {
          console.warn('Sync failed, attempting finish anyway...', err);
          return of(null);
        }),
        switchMap(() =>
          this.workoutService.finish(w.id, this.finishNotes || undefined),
        ),
      )
      .subscribe({
        next: () => {
          this.showFinishConfirm.set(false);
          this.router.navigate(['/history']);
        },
        error: (err) => {
          console.error('Failed to finish workout:', err);
          
          // Parse ASP.NET Web API error response types
          let msg = 'Failed to finish workout. Complete at least 1 set.';
          if (typeof err?.error === 'string') {
            msg = err.error;
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (err?.error?.title) {
            msg = err.error.title;
          }

          this.errorMessage.set(msg);
        },
      });
  }

  cancelWorkout(): void {
    const w = this.workout();
    if (!w) return;
    this.workoutService.cancel(w.id).subscribe({
      next: () => this.router.navigate(['/workout']),
      error: () => this.router.navigate(['/workout']),
    });
  }

  // ── Auto sync ─────────────────────────────────────────────────────────────────

  private autoSync(): void {
    const w = this.workout();
    if (!w) return;
    this.syncing.set(true);
    this.workoutService.sync(w.id, w).subscribe({
      next: () => setTimeout(() => this.syncing.set(false), 800),
      error: () => this.syncing.set(false),
    });
  }
}