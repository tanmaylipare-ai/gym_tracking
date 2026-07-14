import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutDto, WorkoutExerciseDto, WorkoutSetDto, ExerciseDto } from '../../core/models/models';
import { ExercisePickerComponent } from './exercise-picker.component';

@Component({
  selector: 'app-active-workout',
  standalone: true,
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

            <!-- Set column headers -->
            <div class="grid grid-cols-[2rem_1fr_4.5rem_4.5rem_2.5rem] gap-2 px-4 py-2 text-[10px] font-bold text-gym-muted uppercase tracking-wider">
              <span class="text-center">SET</span>
              <span>PREVIOUS</span>
              <span class="text-center">KG</span>
              <span class="text-center">REPS</span>
              <span></span>
            </div>

            <!-- Set rows -->
            @for (set of ex.sets; track set.id; let setIdx = $index) {
              <div class="grid grid-cols-[2rem_1fr_4.5rem_4.5rem_2.5rem] gap-2 items-center px-4 py-2 transition-colors"
                   [ngClass]="{'bg-gym-success/10': set.isCompleted}">
                <!-- Set number -->
                <span class="text-center text-sm font-bold"
                      [class.text-gym-success]="set.isCompleted"
                      [class.text-gym-muted]="!set.isCompleted">
                  {{ set.setNumber }}
                </span>
                <!-- Previous (placeholder for now) -->
                <span class="text-xs text-gym-muted truncate">—</span>
                <!-- Weight input -->
                <input
                  type="number"
                  [(ngModel)]="set.weight"
                  (ngModelChange)="onSetChanged(exIdx, setIdx)"
                  min="0"
                  class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                  [class.border-gym-success]="set.isCompleted"
                />
                <!-- Reps input -->
                <input
                  type="number"
                  [(ngModel)]="set.reps"
                  (ngModelChange)="onSetChanged(exIdx, setIdx)"
                  min="0"
                  class="w-full text-center text-sm font-semibold bg-gym-surface rounded-lg py-2 border border-gym-border focus:outline-none focus:border-gym-accent"
                  [class.border-gym-success]="set.isCompleted"
                />
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
          <div class="w-full card rounded-2xl p-5 space-y-3" (click)="$event.stopPropagation()">
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
          <div class="w-full card rounded-2xl p-5 space-y-3" (click)="$event.stopPropagation()">
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
    // Compute initial elapsed from workout startedAt
    const started = this.workout()?.startedAt;
    if (started) this.startTime = new Date(started).getTime();

    this.elapsedTimer = setInterval(() => {
      this.elapsedSecs.set(Math.floor((Date.now() - this.startTime) / 1000));
    }, 1000);

    // Auto-sync every 30 seconds
    this.syncTimer = setInterval(() => this.autoSync(), 30_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.elapsedTimer);
    clearInterval(this.syncTimer);
  }

  // ── Set operations ────────────────────────────────────────────────────────────

  onSetChanged(_exIdx: number, _setIdx: number): void {
    // Debounce handled by 30s sync timer; immediate local update already done via ngModel
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
    const newSet: WorkoutSetDto = {
      id:          crypto.randomUUID(),
      setNumber:   ex.sets.length + 1,
      reps:        lastSet?.reps ?? 8,
      weight:      lastSet?.weight ?? 0,
      weightUnit:  'kg',
      isCompleted: false,
    };
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

  // ── Exercise picker ───────────────────────────────────────────────────────────

  onExercisesSelected(exercises: ExerciseDto[]): void {
    this.showPicker.set(false);
    const w = this.workout();
    if (!w || !exercises.length) return;

    const updated: WorkoutDto = JSON.parse(JSON.stringify(w));
    const nextOrder = updated.exercises.length;

    exercises.forEach((ex, i) => {
      updated.exercises.push({
        id:              crypto.randomUUID(),
        exerciseId:      ex.id,
        exerciseName:    ex.name,
        exerciseCategory: ex.category,
        order:           nextOrder + i,
        sets: [{
          id:          crypto.randomUUID(),
          setNumber:   1,
          reps:        8,
          weight:      0,
          weightUnit:  'kg',
          isCompleted: false,
        }]
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
    // Final sync then finish
    this.workoutService.sync(w.id, w).subscribe({
      next: () => {
        this.workoutService.finish(w.id, this.finishNotes || undefined).subscribe({
          next: () => this.router.navigate(['/history']),
          error: () => this.router.navigate(['/history']),
        });
      },
      error: () => {
        // Try to finish anyway even if sync fails
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