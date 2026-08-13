import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ExerciseService } from '../../core/services/exercise.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { ExerciseDto } from '../../core/models/models';
import { ChartCardComponent } from '../../shared/components/chart-card.component';
import {
  buildE1rmChartData,
  buildHeaviestVsAwwChartData,
  buildBodyweightVolumeChartData,
  buildMaxRepChartData,
  buildCardioChartData,
  buildBandChartData,
  cardioSubtitle,
  lineChartOptions,
  dualAxisChartOptions,
  groupedBarChartOptions,
} from '../../shared/utils/analytics-chart-builders';
import { ChartConfiguration } from 'chart.js';

@Component({
    selector: 'app-exercise-detail',
    imports: [CommonModule, ChartCardComponent],
    template: `
    <div class="px-4 pt-6 pb-8 safe-top">

      <div class="flex items-center pt-3 pr-1 gap-3 mb-6">
        <button
          type="button"
          (click)="goBack()"
          class="w-10 h-10 rounded-xl bg-gym-surface flex items-center justify-center"
          aria-label="Back to exercises"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 class="text-2xl font-bold">Exercise Details</h1>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          <div class="aspect-video bg-gym-surface rounded-2xl animate-pulse"></div>
          <div class="card rounded-2xl p-5 animate-pulse">
            <div class="h-6 bg-gym-surface rounded w-2/3 mb-3"></div>
            <div class="h-4 bg-gym-surface rounded w-1/3"></div>
          </div>
        </div>
      } @else if (exercise(); as ex) {

        <!-- Video / thumbnail -->
        <div class="rounded-2xl overflow-hidden bg-gym-surface mb-5">
          @if (videoUrl(ex); as video) {
            <video
              [src]="video"
              [poster]="thumbnailUrl(ex) ?? ''"
              controls loop playsinline
              class="w-full aspect-video object-cover"
            ></video>
          } @else if (thumbnailUrl(ex); as thumb) {
            <img [src]="thumb" [alt]="ex.name" class="w-full aspect-video object-contain bg-gym-surface" />
          } @else {
            <div class="w-full aspect-video flex items-center justify-center">
              <svg class="w-12 h-12 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 12h16M4 8v8M8 6v12M16 6v12M20 8v8"/>
              </svg>
            </div>
          }
        </div>

        <!-- Details -->
        <section class="card rounded-2xl p-5 mb-5">
          <h2 class="text-xl font-bold">{{ ex.name }}</h2>

          <div class="flex flex-wrap gap-2 mt-3">
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gym-accent/15 text-gym-fg">
              {{ ex.category }}
            </span>
            <span class="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gym-surface text-gym-muted">
              Equipment : {{ ex.equipment }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gym-border">
            <div>
              <p class="text-[10px] text-gym-muted uppercase tracking-wide">Primary Muscle</p>
              <p class="text-sm font-semibold mt-0.5">{{ ex.muscleGroup }}</p>
            </div>
            @if (ex.secondaryMuscleGroup) {
              <div>
                <p class="text-[10px] text-gym-muted uppercase tracking-wide">Secondary</p>
                <p class="text-sm font-semibold mt-0.5">{{ ex.secondaryMuscleGroup }}</p>
              </div>
            }
          </div>

          @if (ex.description) {
            <div class="mt-4 pt-4 border-t border-gym-border">
              <p class="text-[10px] text-gym-muted uppercase tracking-wide mb-1">How to</p>
              <p class="text-sm">{{ ex.description }}</p>
            </div>
          }
        </section>

        <!-- Analytics — shape depends on this exercise's type -->
        <section class="space-y-4">
          @switch (ex.exerciseType) {
            @case ('WeightTraining') {
              <app-chart-card
                title="Estimated 1-Rep Max"
                subtitle="Epley formula, top set per session"
                type="line"
                [data]="e1rmChartData()"
                [options]="lineOptions"
                [loading]="loadingAnalytics()"
              />
              <app-chart-card
                title="Heaviest Set vs Average Working Weight"
                type="line"
                [data]="heaviestVsAwwChartData()"
                [options]="dualAxisOptions"
                [loading]="loadingAnalytics()"
              />
            }
            @case ('Bodyweight') {
              <app-chart-card
                title="Volume Over Time"
                subtitle="sets × reps per session"
                type="line"
                [data]="bodyweightVolumeChartData()"
                [options]="lineOptions"
                [loading]="loadingAnalytics()"
              />
              <app-chart-card
                title="Max-Rep Set Ceiling"
                subtitle="highest unbroken rep count per session"
                type="line"
                [data]="maxRepChartData()"
                [options]="lineOptions"
                [loading]="loadingAnalytics()"
              />
            }
            @case ('Cardio') {
              <app-chart-card
                title="Pacing Output"
                [subtitle]="cardioChartSubtitle()"
                type="line"
                [data]="cardioChartData()"
                [options]="lineOptions"
                [loading]="loadingAnalytics()"
              />
            }
            @case ('BandTraining') {
              <app-chart-card
                title="Virtual Volume vs Weight Training Volume"
                subtitle="by month"
                type="bar"
                [data]="bandChartData()"
                [options]="groupedBarOptions"
                [loading]="loadingAnalytics()"
              />
            }
          }
        </section>

      } @else {
        <div class="text-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-gym-surface flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gym-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3m0 4h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20h15.6a2 2 0 001.73-3l-7.82-13.5a2 2 0 00-3.42 0z"/>
            </svg>
          </div>
          <p class="font-semibold text-lg">Exercise not found</p>
          <button type="button" (click)="goBack()" class="mt-4 text-sm font-semibold">Return to exercises</button>
        </div>
      }
    </div>
  `
})
export class ExerciseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private exerciseService = inject(ExerciseService);
  private analyticsService = inject(AnalyticsService);

  readonly exercise = signal<ExerciseDto | null>(null);
  readonly loading = signal(true);
  readonly loadingAnalytics = signal(true);

  readonly lineOptions = lineChartOptions;
  readonly dualAxisOptions = dualAxisChartOptions;
  readonly groupedBarOptions = groupedBarChartOptions;

  readonly e1rmChartData = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly heaviestVsAwwChartData = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly bodyweightVolumeChartData = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly maxRepChartData = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly cardioChartData = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });
  readonly cardioChartSubtitle = signal('');
  readonly bandChartData = signal<ChartConfiguration['data']>({ labels: [], datasets: [] });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.loading.set(false);
      this.loadingAnalytics.set(false);
      return;
    }

    this.exerciseService.getById(id).subscribe({
      next: ex => {
        this.exercise.set(ex);
        this.loading.set(false);
        this.loadAnalytics(id, ex.exerciseType);
      },
      error: err => {
        console.error('Failed to load exercise details', err);
        this.loading.set(false);
        this.loadingAnalytics.set(false);
      }
    });
  }

  private loadAnalytics(exerciseId: string, type: ExerciseDto['exerciseType']): void {
    this.loadingAnalytics.set(true);
    const done = () => this.loadingAnalytics.set(false);

    switch (type) {
      case 'WeightTraining':
        this.analyticsService.getWeightTraining(exerciseId).subscribe({
          next: (rows) => {
            this.e1rmChartData.set(buildE1rmChartData(rows));
            this.heaviestVsAwwChartData.set(buildHeaviestVsAwwChartData(rows));
            done();
          },
          error: () => done(),
        });
        break;
      case 'Bodyweight':
        this.analyticsService.getBodyweight(exerciseId).subscribe({
          next: (rows) => {
            this.bodyweightVolumeChartData.set(buildBodyweightVolumeChartData(rows));
            this.maxRepChartData.set(buildMaxRepChartData(rows));
            done();
          },
          error: () => done(),
        });
        break;
      case 'Cardio':
        this.analyticsService.getCardio(exerciseId).subscribe({
          next: (rows) => {
            this.cardioChartData.set(buildCardioChartData(rows));
            this.cardioChartSubtitle.set(cardioSubtitle(rows));
            done();
          },
          error: () => done(),
        });
        break;
      case 'BandTraining':
        this.analyticsService.getBandTraining(exerciseId).subscribe({
          next: (rows) => {
            this.bandChartData.set(buildBandChartData(rows));
            done();
          },
          error: () => done(),
        });
        break;
      default:
        done();
    }
  }

  goBack(): void {
    this.router.navigate(['/exercises']);
  }

  thumbnailUrl(ex: ExerciseDto): string | null {
    return this.exerciseService.mediaUrl(ex.thumbnailUrl);
  }

  videoUrl(ex: ExerciseDto): string | null {
    return this.exerciseService.mediaUrl(ex.videoUrl);
  }
}