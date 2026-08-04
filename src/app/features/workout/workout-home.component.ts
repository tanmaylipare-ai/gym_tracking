import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { WorkoutService } from '../../core/services/workout.service';
import { RoutineService } from '../../core/services/routine.service';
import { AuthService } from '../../core/services/auth.service';
import { RoutineDto } from '../../core/models/models';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-workout-home',
    imports: [FormsModule,TitleCasePipe],
    template: `
    <div class="px-4 pt-6 pb-4 safe-top">

      <!-- Greeting -->
      <div class="mb-6">
        <p class="text-gym-muted pt-1 text-sm">{{ greeting() }}</p>
        <h1 class="text-2xl font-bold mt-0.5">
          {{ (user()?.name ?? 'Athlete') | titlecase }}
        </h1>
      </div>

      <!-- Resume active workout banner -->
      @if (activeWorkout()) {
        <div class="mb-5 card rounded-2xl p-4 border-gym-accent/40 bg-gym-accent/5">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold text-gym-accent uppercase tracking-wide mb-1">Active workout</p>
              <p class="font-bold">{{ activeWorkout()?.name }}</p>
              <p class="text-xs text-gym-muted mt-0.5">
                {{ activeWorkout()?.exercises?.length ?? 0 }} exercises ·
                {{ completedSets() }}/{{ totalSets() }} sets done
              </p>
            </div>
            <button (click)="resumeWorkout()"
                    class="bg-gym-accent text-white text-sm font-bold px-5 py-2.5 rounded-xl">
              Resume
            </button>
          </div>
        </div>
      }

      <!-- Quick start card -->
      @if (!activeWorkout()) {
        <div class="mb-6">
          <h2 class="section-title mb-3">Quick Start</h2>
          <div class="card rounded-2xl p-5">

            <div class="mb-4">
              <label class="block text-sm font-medium text-gym-muted mb-2">Workout name</label>
              <input
                [(ngModel)]="workoutName"
                type="text"
                placeholder="e.g. Monday Push"
                class="input-field"
              />
            </div>

            <button
              (click)="startEmptyWorkout()"
              [disabled]="starting()"
              class="btn-primary">
              @if (starting()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Starting…
                </span>
              } @else {
                Start empty workout
              }
            </button>
          </div>
        </div>
      }

      <!-- Start from routine -->
      @if (!activeWorkout()) {
        <div>
          <h2 class="section-title mb-3">Start from routine</h2>

          @if (loadingRoutines()) {
            <div class="flex justify-center py-8">
              <svg class="animate-spin w-6 h-6 text-gym-accent" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          } @else if (routines().length === 0) {
            <div class="card rounded-2xl p-6 text-center">
              <p class="text-gym-muted text-sm">No routines yet.</p>
              <button (click)="goToRoutines()" class="text-gym-accent text-sm font-semibold mt-2">
                Create a routine →
              </button>
            </div>
          } @else {
            <div class="space-y-3">
              @for (r of routines(); track r.id) {
                <div class="card rounded-2xl p-4 flex items-center justify-between">
                  <div class="min-w-0 mr-3">
                    <p class="font-semibold truncate">{{ r.name }}</p>
                    <p class="text-xs text-gym-muted mt-0.5">
                      {{ r.exercises.length }} exercise{{ r.exercises.length !== 1 ? 's' : '' }}
                    </p>
                  </div>
                  <button (click)="startFromRoutine(r)"
                          [disabled]="starting()"
                          class="bg-gym-accent text-white text-sm font-bold px-4 py-2 rounded-xl flex-shrink-0">
                    Start
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }

      @if (error()) {
        <div class="mt-4 bg-gym-accent/10 border border-gym-accent/30 rounded-xl px-4 py-3">
          <p class="text-gym-accent text-sm">{{ error() }}</p>
        </div>
      }
    </div>
  `
})
export class WorkoutHomeComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private routineService = inject(RoutineService);
  private authService    = inject(AuthService);
  private router         = inject(Router);

  readonly activeWorkout  = this.workoutService.activeWorkout;
  readonly user           = this.authService.user;

  readonly routines       = signal<RoutineDto[]>([]);
  readonly loadingRoutines = signal(true);
  readonly starting       = signal(false);
  readonly error          = signal('');

  workoutName = '';

  readonly greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning,';
    if (h < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  readonly totalSets = () =>
    (this.activeWorkout()?.exercises ?? []).reduce((s, ex) => s + ex.sets.length, 0);

  readonly completedSets = () =>
    (this.activeWorkout()?.exercises ?? []).reduce((s, ex) =>
      s + ex.sets.filter(set => set.isCompleted).length, 0);

  ngOnInit(): void {
    this.routineService.getAll().subscribe({
      next: (r) => { this.routines.set(r); this.loadingRoutines.set(false); },
      error: ()  => this.loadingRoutines.set(false),
    });
  }

  startEmptyWorkout(): void {
    const name = this.workoutName.trim() || 'Workout';
    this.starting.set(true);
    this.error.set('');
    this.workoutService.start(name).subscribe({
      next: () => this.router.navigate(['/workout/active']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to start workout.');
        this.starting.set(false);
      }
    });
  }

  startFromRoutine(routine: RoutineDto): void {
    this.starting.set(true);
    this.error.set('');
    this.workoutService.start(routine.name, routine.id).subscribe({
      next: () => this.router.navigate(['/workout/active']),
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Failed to start workout.');
        this.starting.set(false);
      }
    });
  }

  resumeWorkout(): void {
    this.router.navigate(['/workout/active']);
  }

  goToRoutines(): void {
    this.router.navigate(['/routines']);
  }
}
