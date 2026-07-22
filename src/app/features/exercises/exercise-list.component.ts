import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ExerciseService } from '../../core/services/exercise.service';
import { ExerciseDto } from '../../core/models/models';

interface CategoryFilter {
  label: string;
  value: string | null;
}

@Component({
    selector: 'app-exercise-list',
    imports: [CommonModule],
    template: `
    <div class="px-4 pt-6 pb-4 safe-top">
      <h1 class="text-2xl font-bold mb-4">Exercises</h1>

      <!-- Search -->
      <div class="relative mb-3">
        <input
          type="text"
          [value]="search()"
          (input)="onSearch($event)"
          placeholder="Search exercises…"
          class="w-full bg-gym-surface rounded-xl px-4 py-2.5 text-sm placeholder:text-gym-muted focus:outline-none focus:ring-2 focus:ring-gym-accent"
        />
      </div>

      <!-- Category chips -->
      <div class="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-4 px-4">
        @for (cat of categories; track cat.value) {
          <button
            type="button"
            (click)="selectCategory(cat.value)"
            class="shrink-0 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors"
            [ngClass]="activeCategory() === cat.value
              ? 'bg-gym-accent text-white'
              : 'bg-gym-surface text-gym-muted'"
          >
            {{ cat.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <!-- Loading skeleton -->
        <div class="space-y-2.5">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="card rounded-2xl p-2.5 flex items-center gap-3 animate-pulse">
              <div class="w-16 h-16 shrink-0 rounded-xl bg-gym-surface"></div>
              <div class="flex-1">
                <div class="h-3.5 bg-gym-surface rounded w-3/4 mb-2"></div>
                <div class="h-2.5 bg-gym-surface rounded w-1/2"></div>
              </div>
            </div>
          }
        </div>
      } @else if (filteredExercises().length === 0) {
        <!-- Empty state -->
        <div class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-gym-surface flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
            </svg>
          </div>
          <p class="font-semibold text-lg">No exercises found</p>
          <p class="text-gym-muted text-sm mt-1">Try a different search or category.</p>
        </div>
        } @else {
        <!-- List -->
        <div class="space-y-2.5">
          @for (ex of filteredExercises(); track ex.id) {
            <div
              class="card rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-[0.98] flex items-center gap-3 p-2.5"
              role="button" tabindex="0"
              (click)="openExercise(ex.id)"
              (keydown.enter)="openExercise(ex.id)"
            >
              <div class="w-16 h-16 shrink-0 rounded-xl bg-gym-surface overflow-hidden">
                @if (thumbnail(ex); as thumb) {
                  <img [src]="thumb" [alt]="ex.name" loading="lazy" class="w-full h-full object-cover" />
                } @else {
                  <div class="w-full h-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h16M4 8v8M8 6v12M16 6v12M20 8v8"/>
                    </svg>
                  </div>
                }
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold truncate">{{ ex.name }}</p>
                <p class="text-[11px] text-gym-muted mt-0.5">{{ ex.muscleGroup }} · {{ ex.equipment }}</p>
              </div>

              <span class="text-[10px] font-semibold px-2 py-1 rounded-full bg-gym-accent/15 text-gym-accent shrink-0">
                {{ ex.category }}
              </span>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ExerciseListComponent implements OnInit {
  private exerciseService = inject(ExerciseService);
  private router = inject(Router);

  readonly exercises = signal<ExerciseDto[]>([]);
  readonly loading = signal(true);
  readonly search = signal('');
  readonly activeCategory = signal<string | null>(null);

  readonly categories: CategoryFilter[] = [
    { label: 'All', value: null },
    { label: 'Push', value: 'Push' },
    { label: 'Pull', value: 'Pull' },
    { label: 'Legs', value: 'Legs' },
    { label: 'Core', value: 'Core' },
    { label: 'Cardio', value: 'Cardio' },
  ];

  readonly filteredExercises = computed(() => {
    const term = this.search().trim().toLowerCase();
    const cat = this.activeCategory();
    return this.exercises().filter(e =>
      (!cat || e.category === cat) &&
      (!term || e.name.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.exerciseService.getAll().subscribe({
      next: list => {
        this.exercises.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  selectCategory(value: string | null): void {
    this.activeCategory.set(value);
  }

  thumbnail(ex: ExerciseDto): string | null {
    return this.exerciseService.mediaUrl(ex.thumbnailUrl);
  }

  openExercise(id: string): void {
    this.router.navigate(['/exercises', id]);
  }
}