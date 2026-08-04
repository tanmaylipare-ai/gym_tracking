import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutDto } from '../../core/models/models';

@Component({
    selector: 'app-workout-detail',
    imports: [
        CommonModule,
        DatePipe
    ],
    template: `
    <div class="px-4 pt-6 pb-8 safe-top">

      <!-- Header -->
      <div class="flex items-center pt-2 pl-1 gap-3 mb-6">

        <button
          type="button"
          (click)="goBack()"
          class="w-10 h-10 rounded-xl bg-gym-surface flex items-center justify-center"
          aria-label="Back to history"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 class="text-2xl font-bold">
          Workout Details
        </h1>

      </div>


@if (loading()) {

  <!-- Loading -->
  <div class="space-y-4">

    <div class="card rounded-2xl p-5 animate-pulse">
      <div
        class="h-6 bg-gym-surface rounded w-2/3 mb-3"
      ></div>

      <div
        class="h-4 bg-gym-surface rounded w-1/3"
      ></div>
    </div>

    @for (i of [1, 2, 3]; track i) {

      <div class="card rounded-2xl p-5 animate-pulse">
        <div
          class="h-5 bg-gym-surface rounded w-1/2 mb-4"
        ></div>

        <div
          class="h-12 bg-gym-surface rounded"
        ></div>
      </div>

    }

  </div>

} @else {

  @if (workout(); as w) {

    <!-- Your entire workout UI goes here -->

    <section class="card rounded-2xl p-5 mb-6">

      <div class="flex items-start justify-between gap-4">

        <div>
          <h2 class="text-xl font-bold">
            {{ w.name }}
          </h2>

          <p class="text-sm text-gym-muted mt-1">
            {{
              w.startedAt
                | date:'EEEE, MMMM d, y · h:mm a'
            }}
          </p>
        </div>

        <span
          class="text-[11px] font-semibold px-2.5 py-1 rounded-full"
          [ngClass]="
            w.status === 'Completed'
              ? 'bg-gym-surface text-gym-success'
              : 'bg-gym-surface text-gym-muted'
          "
        >
          {{ w.status }}
        </span>

      </div>

      <div
        class="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gym-border"
      >

        <div>
          <p class="text-lg font-bold">
            {{ w.exercises.length }}
          </p>

          <p
            class="text-[10px] text-gym-muted uppercase tracking-wide"
          >
            Exercises
          </p>
        </div>

        <div>
          <p class="text-lg font-bold">
            {{ completedSets(w) }}/{{ totalSets(w) }}
          </p>

          <p
            class="text-[10px] text-gym-muted uppercase tracking-wide"
          >
            Sets
          </p>
        </div>

        <div>
          <p class="text-lg font-bold">
            {{ duration(w.startedAt, w.finishedAt) }}
          </p>

          <p
            class="text-[10px] text-gym-muted uppercase tracking-wide"
          >
            Duration
          </p>
        </div>

      </div>

      @if (w.notes) {

        <div
          class="mt-4 pt-4 border-t border-gym-border"
        >
          <p
            class="text-[10px] text-gym-muted uppercase tracking-wide mb-1"
          >
            Notes
          </p>

          <p class="text-sm">
            {{ w.notes }}
          </p>
        </div>

      }

    </section>


    <!-- Exercises -->

    <div class="space-y-4">

      @for (
        exercise of w.exercises;
        track exercise.id
      ) {

        <section class="card rounded-2xl overflow-hidden">

          <div class="p-4 border-b border-gym-border">

            <div
              class="flex items-start justify-between gap-3"
            >

              <div>
                <h3 class="font-bold">
                  {{ exercise.exerciseName }}
                </h3>

                <p class="text-xs text-gym-muted mt-1">
                  {{ exercise.exerciseCategory }}
                  ·
                  {{ completedExerciseSets(exercise) }}/{{ exercise.sets.length }}
                  sets completed
                </p>
              </div>

              <span class="text-xs text-gym-muted">
                #{{ exercise.order + 1 }}
              </span>

            </div>

            @if (exercise.notes) {

              <p class="text-sm text-gym-muted mt-3">
                {{ exercise.notes }}
              </p>

            }

          </div>


          <!-- Set header -->

          <div class="px-4 pt-4">

            <div
              class="grid grid-cols-4 gap-2 px-2 pb-2"
            >

              <span
                class="text-[10px] text-gym-muted uppercase tracking-wide"
              >
                Set
              </span>

              <span
                class="text-[10px] text-gym-muted uppercase tracking-wide"
              >
                Weight
              </span>

              <span
                class="text-[10px] text-gym-muted uppercase tracking-wide"
              >
                Reps
              </span>

              <span
                class="text-[10px] text-gym-muted uppercase tracking-wide text-right"
              >
                Status
              </span>

            </div>

          </div>


          <!-- Sets -->

          <div class="px-4 pb-4">

            @for (
              set of exercise.sets;
              track set.id
            ) {

              <div
                class="grid grid-cols-4 gap-2 items-center px-2 py-3 border-t border-gym-border"
                [class.opacity-50]="!set.isCompleted"
              >

                <span class="font-semibold">
                  {{ set.setNumber }}
                </span>

                <span>
                  {{ set.weight }}

                  <span class="text-xs text-gym-muted">
                    {{ set.weightUnit }}
                  </span>
                </span>

                <span>
                  {{ set.reps }}
                </span>

                <div class="flex justify-end">

                  @if (set.isCompleted) {

                    <span
                      class="w-6 h-6 rounded-full bg-gym-success/15 text-gym-success flex items-center justify-center text-xs font-bold"
                      title="Completed"
                    >
                      ✓
                    </span>

                  } @else {

                    <span
                      class="text-[10px] text-gym-muted"
                    >
                      Not completed
                    </span>

                  }

                </div>

              </div>

            }

          </div>

        </section>

      }

    </div>

  } @else {

    <!-- Error / not found -->

    <div class="text-center py-20">

      <div
        class="w-16 h-16 rounded-2xl bg-gym-surface flex items-center justify-center mx-auto mb-4"
      >
        <svg
          class="w-8 h-8 text-gym-muted"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-3l-7.82-13.5a2 2 0 00-3.42 0z"
          />
        </svg>
      </div>

      <p class="font-semibold text-lg">
        Workout not found
      </p>

      <p class="text-sm text-gym-muted mt-1">
        The workout could not be loaded.
      </p>

      <button
        type="button"
        (click)="goBack()"
        class="mt-4 text-sm font-semibold"
      >
        Return to history
      </button>

    </div>

  }
}

    </div>
  `
})
export class WorkoutDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private workoutService = inject(WorkoutService);

  readonly workout = signal<WorkoutDto | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      return;
    }

    this.workoutService.getById(id).subscribe({
      next: workout => {
        this.workout.set(workout);
        this.loading.set(false);
      },
      error: err => {
        console.error(
          'Failed to load workout details',
          err
        );

        this.loading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/history']);
  }

  totalSets(workout: WorkoutDto): number {
    return workout.exercises.reduce(
      (total, exercise) =>
        total + exercise.sets.length,
      0
    );
  }

  completedSets(workout: WorkoutDto): number {
    return workout.exercises.reduce(
      (total, exercise) =>
        total +
        exercise.sets.filter(
          set => set.isCompleted
        ).length,
      0
    );
  }

  completedExerciseSets(
    exercise: WorkoutDto['exercises'][number]
  ): number {
    return exercise.sets.filter(
      set => set.isCompleted
    ).length;
  }

  duration(
    start: string,
    end: string | null
  ): string {
    if (!end) {
      return '—';
    }

    const minutes = Math.round(
      (
        new Date(end).getTime() -
        new Date(start).getTime()
      ) / 60_000
    );

    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}m`
      : `${hours}h`;
  }
}