import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WorkoutService } from '../../core/services/workout.service';
import { WorkoutSummaryDto } from '../../core/models/models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="px-4 pt-6 pb-4 safe-top">

      <!-- Header -->
      <h1 class="text-2xl font-bold mb-6">History</h1>

      <!-- Loading skeleton -->
      @if (loading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="card rounded-2xl p-4 animate-pulse">
              <div class="h-4 bg-gym-surface rounded w-2/3 mb-2"></div>
              <div class="h-3 bg-gym-surface rounded w-1/3"></div>
            </div>
          }
        </div>
      } @else if (workouts().length === 0) {
        <!-- Empty state -->
        <div class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-gym-surface flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="font-semibold text-lg">No workouts yet</p>
          <p class="text-gym-muted text-sm mt-1">Completed workouts will appear here.</p>
        </div>
      } @else {
        <!-- Workout list -->
        <div class="space-y-3">
          @for (w of workouts(); track w.id) {
            <div class="card rounded-2xl p-4">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-bold">{{ w.name }}</p>
                  <p class="text-xs text-gym-muted mt-1">
                    {{ w.startedAt | date:'EEE, MMM d · h:mm a' }}
                  </p>
                </div>
                <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      [ngClass]="w.status === 'Completed'
                        ? 'bg-gym-success/15 text-gym-success'
                        : 'bg-gym-muted/15 text-gym-muted'">
                  {{ w.status }}
                </span>
              </div>

              <!-- Stats row -->
              <div class="flex gap-4 mt-3 pt-3 border-t border-gym-border">
                <div class="text-center">
                  <p class="text-base font-bold">{{ w.totalExercises }}</p>
                  <p class="text-[10px] text-gym-muted uppercase tracking-wide">Exercises</p>
                </div>
                <div class="text-center">
                  <p class="text-base font-bold">{{ w.completedSets }}/{{ w.totalSets }}</p>
                  <p class="text-[10px] text-gym-muted uppercase tracking-wide">Sets</p>
                </div>
                @if (w.finishedAt) {
                  <div class="text-center">
                    <p class="text-base font-bold">{{ duration(w.startedAt, w.finishedAt) }}</p>
                    <p class="text-[10px] text-gym-muted uppercase tracking-wide">Duration</p>
                  </div>
                }
              </div>
            </div>
          }
        </div>

        <!-- Load more -->
        @if (hasMore()) {
          <button (click)="loadMore()" [disabled]="loadingMore()"
                  class="w-full mt-4 py-3 text-sm font-semibold text-gym-muted border border-gym-border rounded-xl">
            @if (loadingMore()) { Loading… } @else { Load more }
          </button>
        }
      }
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private workoutService = inject(WorkoutService);

  readonly workouts    = signal<WorkoutSummaryDto[]>([]);
  readonly loading     = signal(true);
  readonly loadingMore = signal(false);
  readonly hasMore     = signal(false);

  private page = 1;

  ngOnInit(): void {
    this.workoutService.getHistory(1, 20).subscribe({
      next: (res) => {
        this.workouts.set(res.items);
        this.hasMore.set(res.page < res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadMore(): void {
    this.loadingMore.set(true);
    this.page++;
    this.workoutService.getHistory(this.page, 20).subscribe({
      next: (res) => {
        this.workouts.update(list => [...list, ...res.items]);
        this.hasMore.set(res.page < res.totalPages);
        this.loadingMore.set(false);
      },
      error: () => this.loadingMore.set(false),
    });
  }

  duration(start: string, end: string): string {
    const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}