import { Component, inject, signal, computed, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService } from '../../core/services/exercise.service';
import { ExerciseDto } from '../../core/models/models';

@Component({
  selector: 'app-exercise-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 flex flex-col bg-gym-bg safe-top safe-bottom">

      <!-- Header -->
      <div class="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gym-border">
        <button (click)="close.emit()" class="text-gym-muted p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        <h2 class="text-lg font-bold flex-1">Add Exercise</h2>
        @if (selected().length) {
          <button (click)="confirmSelection()"
                  class="bg-gym-accent text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            Add ({{ selected().length }})
          </button>
        }
      </div>

      <!-- Search -->
      <div class="px-4 py-3">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gym-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            [(ngModel)]="searchQuery"
            type="text"
            placeholder="Search exercises…"
            class="input-field pl-10"
          />
        </div>
      </div>

      <!-- Category pills -->
      <div class="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        <button
          (click)="activeCategory.set('')"
          [class]="activeCategory() === '' ? 'bg-gym-accent text-white' : 'bg-gym-surface text-gym-muted'"
          class="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
          All
        </button>
        @for (cat of categories(); track cat) {
          <button
            (click)="activeCategory.set(cat)"
            [class]="activeCategory() === cat ? 'bg-gym-accent text-white' : 'bg-gym-surface text-gym-muted'"
            class="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Exercise list -->
      <div class="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        @if (loading()) {
          <div class="flex justify-center py-16">
            <svg class="animate-spin w-8 h-8 text-gym-accent" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        } @else if (filtered().length === 0) {
          <div class="text-center py-16 text-gym-muted">
            <p class="text-lg">No exercises found</p>
            <p class="text-sm mt-1">Try a different search or category</p>
          </div>
        } @else {
          @for (ex of filtered(); track ex.id) {
            <button
              (click)="toggleSelect(ex)"
              class="w-full flex items-center gap-3 p-3.5 card rounded-xl text-left transition-colors"
              [class.border-gym-accent]="isSelected(ex.id)"
              [ngClass]="{'bg-gym-accent/5': isSelected(ex.id)}">
              <!-- Check circle -->
              <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
                   [class.border-gym-accent]="isSelected(ex.id)"
                   [class.bg-gym-accent]="isSelected(ex.id)"
                   [class.border-gym-border]="!isSelected(ex.id)">
                @if (isSelected(ex.id)) {
                  <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                }
              </div>
              <div class="min-w-0">
                <p class="font-semibold text-sm truncate">{{ ex.name }}</p>
                <p class="text-xs text-gym-muted mt-0.5">{{ ex.category }} · {{ ex.muscleGroup }}</p>
              </div>
              @if (ex.isCustom) {
                <span class="ml-auto text-[10px] font-bold text-gym-accent border border-gym-accent/40 rounded px-1.5 py-0.5 flex-shrink-0">CUSTOM</span>
              }
            </button>
          }
        }
      </div>
    </div>
  `
})
export class ExercisePickerComponent implements OnInit {
  private exerciseService = inject(ExerciseService);

  close    = output<void>();
  selected$ = output<ExerciseDto[]>();

  readonly loading       = signal(true);
  readonly exercises     = signal<ExerciseDto[]>([]);
  readonly selected      = signal<ExerciseDto[]>([]);
  readonly activeCategory = signal('');
  searchQuery = '';

  readonly categories = computed(() =>
    [...new Set(this.exercises().map(e => e.category))].sort()
  );

  readonly filtered = computed(() => {
    const q   = this.searchQuery.toLowerCase();
    const cat = this.activeCategory();
    return this.exercises().filter(e =>
      (!cat || e.category === cat) &&
      (!q   || e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q))
    );
  });

  ngOnInit(): void {
    this.exerciseService.getAll().subscribe({
      next: (list) => { this.exercises.set(list); this.loading.set(false); },
      error: ()     => this.loading.set(false)
    });
  }

  toggleSelect(ex: ExerciseDto): void {
    const current = this.selected();
    const idx = current.findIndex(e => e.id === ex.id);
    this.selected.set(idx >= 0
      ? current.filter(e => e.id !== ex.id)
      : [...current, ex]
    );
  }

  isSelected(id: string): boolean {
    return this.selected().some(e => e.id === id);
  }

  confirmSelection(): void {
    this.selected$.emit(this.selected());
  }
}