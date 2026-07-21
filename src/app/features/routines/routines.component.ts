import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoutineService, CreateRoutinePayload } from '../../core/services/routine.service';
import { ExerciseService } from '../../core/services/exercise.service';
import { RoutineDto, ExerciseDto } from '../../core/models/models';

@Component({
    selector: 'app-routines',
    imports: [CommonModule, FormsModule],
    template: `
    <div class="px-4 pt-6 pb-4 safe-top">

      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Routines</h1>
        <button (click)="openCreate()" class="bg-gym-accent text-white text-sm font-bold px-4 py-2 rounded-xl">
          + New
        </button>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex justify-center py-16">
          <svg class="animate-spin w-8 h-8 text-gym-accent" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      } @else if (routines().length === 0) {
        <!-- Empty state -->
        <div class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-gym-surface flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="font-semibold text-lg">No routines yet</p>
          <p class="text-gym-muted text-sm mt-1">Build a routine to quickly start structured workouts.</p>
          <button (click)="openCreate()" class="mt-4 bg-gym-accent text-white text-sm font-bold px-6 py-2.5 rounded-xl">
            Create routine
          </button>
        </div>
      } @else {
        <!-- Routine list -->
        <div class="space-y-3">
          @for (r of routines(); track r.id) {
            <div class="card rounded-2xl p-4">
              <div class="flex items-start justify-between">
                <div class="min-w-0 mr-3">
                  <p class="font-bold text-base truncate">{{ r.name }}</p>
                  @if (r.description) {
                    <p class="text-gym-muted text-sm mt-0.5 line-clamp-2">{{ r.description }}</p>
                  }
                  <p class="text-xs text-gym-muted mt-2">
                    {{ r.exercises.length }} exercise{{ r.exercises.length !== 1 ? 's' : '' }}
                  </p>

                  <!-- Exercise chips -->
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    @for (ex of r.exercises.slice(0, 4); track ex.id) {
                      <span class="text-[11px] bg-gym-surface text-gym-muted px-2 py-0.5 rounded-md">
                        {{ ex.exerciseName }}
                      </span>
                    }
                    @if (r.exercises.length > 4) {
                      <span class="text-[11px] bg-gym-surface text-gym-muted px-2 py-0.5 rounded-md">
                        +{{ r.exercises.length - 4 }} more
                      </span>
                    }
                  </div>
                </div>

                <button (click)="deleteRoutine(r.id)" class="text-gym-muted p-1.5 flex-shrink-0">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Create routine modal -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 pb-6" (click)="showModal.set(false)">
        <div class="w-full max-w-md card rounded-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          <h2 class="font-bold text-xl">New Routine</h2>

          <div>
            <label class="block text-sm text-gym-muted mb-2">Name *</label>
            <input [(ngModel)]="newName" type="text" placeholder="e.g. Push Day" class="input-field"/>
          </div>

          <div>
            <label class="block text-sm text-gym-muted mb-2">Description</label>
            <input [(ngModel)]="newDescription" type="text" placeholder="Optional" class="input-field"/>
          </div>

          <div>
            <label class="block text-sm text-gym-muted mb-3">Exercises</label>
            @if (loadingExercises()) {
              <p class="text-gym-muted text-sm">Loading exercises…</p>
            } @else {
              <div class="max-h-52 overflow-y-auto space-y-2 pr-1">
                @for (ex of allExercises(); track ex.id) {
                  <label class="flex items-center gap-3 p-3 bg-gym-surface rounded-xl cursor-pointer">
                    <input type="checkbox" [value]="ex.id"
                           (change)="toggleExercise(ex, $event)"
                           class="w-4 h-4 accent-gym-accent"/>
                    <div>
                      <p class="text-sm font-medium">{{ ex.name }}</p>
                      <p class="text-xs text-gym-muted">{{ ex.category }}</p>
                    </div>
                  </label>
                }
              </div>
            }
          </div>

          @if (createError()) {
            <p class="text-gym-accent text-sm">{{ createError() }}</p>
          }

          <button (click)="createRoutine()" [disabled]="creating() || !newName.trim()" class="btn-primary">
            @if (creating()) { Creating… } @else { Create routine }
          </button>
          <button (click)="showModal.set(false)" class="btn-secondary">Cancel</button>
        </div>
      </div>
    }
  `
})
export class RoutinesComponent implements OnInit {
  private routineService  = inject(RoutineService);
  private exerciseService = inject(ExerciseService);

  readonly routines         = signal<RoutineDto[]>([]);
  readonly allExercises     = signal<ExerciseDto[]>([]);
  readonly loading          = signal(true);
  readonly loadingExercises = signal(true);
  readonly showModal        = signal(false);
  readonly creating         = signal(false);
  readonly createError      = signal('');

  newName        = '';
  newDescription = '';
  selectedExercises: ExerciseDto[] = [];

  ngOnInit(): void {
    this.routineService.getAll().subscribe({
      next: (r) => { this.routines.set(r); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.newName = '';
    this.newDescription = '';
    this.selectedExercises = [];
    this.createError.set('');
    this.showModal.set(true);

    if (this.allExercises().length === 0) {
      this.exerciseService.getAll().subscribe({
        next: (e) => { this.allExercises.set(e); this.loadingExercises.set(false); },
        error: () => this.loadingExercises.set(false),
      });
    }
  }

  toggleExercise(ex: ExerciseDto, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedExercises = [...this.selectedExercises, ex];
    } else {
      this.selectedExercises = this.selectedExercises.filter(e => e.id !== ex.id);
    }
  }

  createRoutine(): void {
    if (!this.newName.trim()) return;
    this.creating.set(true);
    this.createError.set('');

    const payload: CreateRoutinePayload = {
      name:        this.newName.trim(),
      description: this.newDescription.trim() || undefined,
      exercises:   this.selectedExercises.map((ex, i) => ({
        exerciseId:    ex.id,
        order:         i,
        defaultSets:   3,
        defaultReps:   8,
        defaultWeight: 0,
        notes:         '',
      })),
    };

    this.routineService.create(payload).subscribe({
      next: (r) => {
        this.routines.update(list => [r, ...list]);
        this.showModal.set(false);
        this.creating.set(false);
      },
      error: (err) => {
        this.createError.set(err?.error?.message ?? 'Failed to create routine.');
        this.creating.set(false);
      }
    });
  }

  deleteRoutine(id: string): void {
    this.routineService.delete(id).subscribe({
      next: () => this.routines.update(list => list.filter(r => r.id !== id)),
    });
  }
}
