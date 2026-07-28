import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutDto, WorkoutExerciseDto, WorkoutSetDto, ExerciseDto, ExerciseType } from '../../core/models/models';
import { ExercisePickerComponent } from './exercise-picker.component';

const BAND_LEVELS = ['Light', 'Medium', 'Heavy', 'X-Heavy'];

@Component({
    selector: 'app-active-workout',
    imports: [CommonModule, FormsModule, ExercisePickerComponent],
    template: `
    <div class="flex flex-col min-h-screen bg-gym-bg pb-24 safe-top">

      <!-- Sticky header -->
      <div class="sticky top-0 z-30 bg-gym-bg/95 backdrop-blur border-b border-gym-border px-4 pt-4 pb-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-bold">{{ workout()?.name ?? 'Workout' }}</h1>
            <p class="text-xs text-gym-muted mt-0.5">{{ elapsedStr() }}</p>
          </div>
          <div class="flex gap-2">
            <button (click)="showCancelConfirm.set(true)"
                    class="text-gym-muted text-sm px-3 py-1.5 rounded-lg border border-gym-border">
              Cancel
            </button>
            <button (click)="confirmFinish()"
                    class="bg-gym-success text-gym-bg text-sm font-bold px-4 py-1.5 rounded-lg">
              Finish
            </button>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="px-4 pt-4 space-y-4">

        @for (ex of workout()?.exercises ?? []; track ex.id; let exIdx = $index) {
          <div class="card rounded-2xl overflow-hidden">

            <!-- Exercise header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-gym-border">
              <div>
                <p class="font-bold">{{ ex.exerciseName }}</p>
                <p class="text-xs text-gym-muted mt-0.5">{{ ex.exerciseCategory }}</p>
              </div>
              <button (click)="removeExercise(exIdx)"
                      class="text-gym-muted p-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Set column headers (per exercise type) -->
            <div class="grid gap-2 px-4 py-2 text-[10px] font-bold text-gym-muted uppercase tracking-wider"
                [style.grid-template-columns]="gridTemplateColumns(ex.exerciseType)">
              <span class="text-center">SET</span>
              @for (header of columnHeaders(ex.exerciseType); track header) {
                <span [class.text-center]="header !== 'PREVIOUS'">{{ header }}</span>
              }
              <span></span>
            </div>

            <!-- Set rows -->
            @for (set of ex.sets; track set.id; let setIdx = $index) {
            <div class="grid gap-2 items-center px-4 py-2 transition-colors"
                [style.grid-template-columns]="gridTemplateColumns(ex.exerciseType)"
                [class.bg-gym-success/10]="set.isCompleted">

                <!-- Set number -->
                <span class="text-center text-sm font-bold"
                      [class.text-gym-success]="set.isCompleted"
                      [class.text-gym-muted]="!set.isCompleted">
                  {{ set.setNumber }}
                </span>

                <!-- Previous (placeholder) -->
                <span class="text-xs text-gym-muted truncate">—</span>

                @switch (ex.exerciseType) {

                  @case ('WeightTraining') {
                    <input
                      type="number" [(ngModel)]="set.weight" (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0" placeholder="kg"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                    <input
                      type="number" [(ngModel)]="set.reps" (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0" placeholder="reps"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                  @case ('Bodyweight') {
                    <input
                      type="number" [(ngModel)]="set.reps" (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0" placeholder="reps"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                  @case ('Cardio') {
                    <input
                      type="text" inputmode="numeric" [value]="formatDuration(set.durationSeconds)"
                      (change)="onDurationChanged(exIdx, setIdx, $event)"
                      placeholder="mm:ss"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                    <input
                      type="number" [(ngModel)]="set.distance" (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0" step="0.1" placeholder="km"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                  @case ('BandTraining') {
                    <select
                      [(ngModel)]="set.bandLevel" (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      class="w-full text-center text-xs font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    >
                      @for (level of bandLevels; track level) {
                        <option [value]="level">{{ level }}</option>
                      }
                    </select>
                    <input
                      type="number" [(ngModel)]="set.reps" (ngModelChange)="onSetChanged(exIdx, setIdx)"
                      min="0" placeholder="reps"
                      class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                      [class.border-gym-success]="set.isCompleted"
                    />
                  }

                }

                <!-- Complete toggle -->
                <button (click)="toggleSetComplete(exIdx, setIdx)"
                        class="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
                        [class.bg-gym-success]="set.isCompleted"
                        [class.bg-gym-surface]="!set.isCompleted">
                  <svg class="w-4 h-4" [class.text-gym-bg]="set.isCompleted" [class.text-gym-muted]="!set.isCompleted"
                       fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                </button>
              </div>
            }

            <!-- Add set button -->
            <button (click)="addSet(exIdx)"
                    class="w-full py-3 text-sm font-semibold text-gym-accent border-t border-gym-border transition-opacity active:opacity-60">
              + Add Set
            </button>
          </div>
        }

        <!-- Add exercise button -->
        <button (click)="showPicker.set(true)"
                class="w-full py-4 rounded-2xl border-2 border-dashed border-gym-border text-gym-accent font-semibold text-sm transition-colors active:border-gym-accent/60">
          + Add Exercise
        </button>

      </div>

      <!-- Sync indicator -->
      @if (syncing()) {
        <div class="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gym-surface text-xs text-gym-muted px-3 py-1.5 rounded-full border border-gym-border">
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
        <div class="fixed inset-0 z-50 bg-black/60 flex items-center px-4 pb-8 safe-bottom" (click)="showCancelConfirm.set(false)">
          <div class="w-full max-w-md mx-auto card rounded-2xl p-5 space-y-3" (click)="$event.stopPropagation()">
            <h3 class="font-bold text-lg">Cancel workout?</h3>
            <p class="text-gym-muted text-sm">This workout will be deleted and cannot be recovered.</p>
            <button (click)="cancelWorkout()" class="w-full bg-gym-accent text-white font-semibold py-3 rounded-xl">
              Yes, cancel workout
            </button>
            <button (click)="showCancelConfirm.set(false)" class="btn-secondary">
              Keep going
            </button>
          </div>
        </div>
      }

      <!-- Finish confirm modal -->
      @if (showFinishConfirm()) {
        <div class="fixed inset-0 z-50 bg-black/60 flex items-center px-4 pb-8 safe-bottom" (click)="showFinishConfirm.set(false)">
          <div class="w-full max-w-md mx-auto card rounded-2xl p-5 space-y-3" (click)="$event.stopPropagation()">
            <h3 class="font-bold text-lg">Finish workout?</h3>
            <p class="text-gym-muted text-sm">
              {{ completedSets() }} of {{ totalSets() }} sets completed.
            </p>
            <textarea
              [(ngModel)]="finishNotes"
              placeholder="Optional notes…"
              rows="2"
              class="input-field resize-none"
            ></textarea>
            <button (click)="finishWorkout()" class="w-full bg-gym-success text-gym-bg font-bold py-3 rounded-xl">
              Finish workout
            </button>
            <button (click)="showFinishConfirm.set(false)" class="btn-secondary">
              Back
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ActiveWorkoutComponent implements OnInit, OnDestroy {
  private workoutService = inject(WorkoutService);
  private router         = inject(Router);

  readonly workout           = this.workoutService.activeWorkout;
  readonly showPicker        = signal(false);
  readonly syncing           = signal(false);
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
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  });

  readonly totalSets = computed(() =>
    (this.workout()?.exercises ?? []).reduce((sum, ex) => sum + ex.sets.length, 0)
  );

  readonly completedSets = computed(() =>
    (this.workout()?.exercises ?? []).reduce((sum, ex) =>
      sum + ex.sets.filter(s => s.isCompleted).length, 0
    )
  );

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
      case 'WeightTraining': return '2rem 1fr 4.5rem 4.5rem 2.5rem';
      case 'Bodyweight':     return '2rem 1fr 4.5rem 2.5rem';
      case 'Cardio':         return '2rem 1fr 5rem 5rem 2.5rem';
      case 'BandTraining':   return '2rem 1fr 5.5rem 4.5rem 2.5rem';
      default:               return '2rem 1fr 4.5rem 4.5rem 2.5rem';
    }
  }

  columnHeaders(type: ExerciseType): string[] {
    switch (type) {
      case 'WeightTraining': return ['PREVIOUS', 'KG', 'REPS'];
      case 'Bodyweight':     return ['PREVIOUS', 'REPS'];
      case 'Cardio':         return ['PREVIOUS', 'TIME', 'KM'];
      case 'BandTraining':   return ['PREVIOUS', 'BAND', 'REPS'];
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
      const [m, s] = trimmed.split(':').map(n => parseInt(n, 10) || 0);
      return m * 60 + s;
    }
    return parseInt(trimmed, 10) || 0;
  }

  onDurationChanged(exIdx: number, setIdx: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const w = this.workout();
    if (!w) return;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    updated.exercises[exIdx].sets[setIdx].durationSeconds = this.parseDuration(value);
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

  removeExercise(exIdx: number): void {
    const w = this.workout();
    if (!w) return;
    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    updated.exercises.splice(exIdx, 1);
    this.workoutService.updateLocalWorkout(updated);
  }

  /** Builds a new set for the given exercise type, carrying over the previous set's values as a starting point. */
  private buildSet(type: ExerciseType, setNumber: number, previous?: WorkoutSetDto): WorkoutSetDto {
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
        return { ...base, reps: previous?.reps ?? 8, weight: previous?.weight ?? 0, weightUnit: 'kg' };
      case 'Bodyweight':
        return { ...base, reps: previous?.reps ?? 8 };
      case 'Cardio':
        return { ...base, durationSeconds: previous?.durationSeconds ?? 60, distance: previous?.distance ?? null, distanceUnit: 'km' };
      case 'BandTraining':
        return { ...base, reps: previous?.reps ?? 8, bandLevel: previous?.bandLevel ?? 'Medium' };
      default:
        console.warn(`Unknown exercise type "${type}", defaulting to WeightTraining set shape.`);
        return { ...base, reps: previous?.reps ?? 8, weight: previous?.weight ?? 0, weightUnit: 'kg' };
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
        id:               crypto.randomUUID(),
        exerciseId:       ex.id,
        exerciseName:     ex.name,
        exerciseCategory: ex.category,
        exerciseType:     ex.exerciseType,
        order:            nextOrder + i,
        sets: [this.buildSet(ex.exerciseType, 1)]
      });
    });
    this.workoutService.updateLocalWorkout(updated);
  }

  // ── Finish / cancel ───────────────────────────────────────────────────────────

  confirmFinish(): void {
    this.showFinishConfirm.set(true);
  }

  finishWorkout(): void {
    const w = this.workout();
    if (!w) return;
    this.workoutService.sync(w.id, w).subscribe({
      next: () => {
        this.workoutService.finish(w.id, this.finishNotes || undefined).subscribe({
          next: () => this.router.navigate(['/history']),
          error: () => this.router.navigate(['/history']),
        });
      },
      error: () => {
        this.workoutService.finish(w.id, this.finishNotes || undefined).subscribe({
          next: () => this.router.navigate(['/history']),
          error: () => this.router.navigate(['/history']),
        });
      }
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