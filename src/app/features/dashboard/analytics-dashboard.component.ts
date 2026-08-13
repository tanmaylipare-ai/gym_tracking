import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AnalyticsService } from '../../core/services/analytics.service';
// TODO: verify this import/method name against your actual exercise service —
// inferred from IExerciseService.GetAllAsync(userId) on the backend.
import { ExerciseService } from '../../core/services/exercise.service';
import {
  ExerciseDto,
  ExerciseType,
  WeightTrainingPointDto,
  TonnageEfficiencyPointDto,
  BodyweightPointDto,
  CardioPointDto,
  SessionCompositionPointDto,
  BandVolumePointDto,
} from '../../core/models/models';
import { ChartCardComponent } from '../../shared/components/chart-card.component';
import {
  buildE1rmChartData,
  buildHeaviestVsAwwChartData,
  buildBodyweightVolumeChartData,
  buildMaxRepChartData,
  buildCardioChartData,
  buildBandChartData,
  cardioSubtitle as buildCardioSubtitle,
  lineChartOptions,
  barChartOptions,
  groupedBarChartOptions,
  dualAxisChartOptions,
  doughnutChartOptions,
  getChartTheme,
} from '../../shared/utils/analytics-chart-builders';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartCardComponent],
  template: `
    <div class="flex flex-col min-h-screen bg-gym-bg pb-24 safe-top px-4 pt-4 space-y-4">
      <h1 class="text-lg font-bold">Analytics</h1>

      <!-- Session-wide charts: always visible regardless of exercise selection -->
      <app-chart-card
        title="Tonnage Efficiency"
        subtitle="kg moved per minute in the gym"
        type="bar"
        [data]="tonnageChartData()"
        [options]="barOptions"
        [loading]="loadingSessionWide()"
      />

      <app-chart-card
        title="Cardio vs Strength Time"
        subtitle="most recent week"
        type="doughnut"
        [data]="sessionCompositionChartData()"
        [options]="doughnutOptions"
        [loading]="loadingSessionWide()"
      />

      <!-- Exercise picker -->
      <!-- <div class="card rounded-2xl p-4">
        <label class="text-xs font-bold text-gym-muted uppercase tracking-wider">
          Exercise
        </label>
        <select
          [ngModel]="selectedExerciseId()"
          (ngModelChange)="onExerciseSelected($event)"
          class="w-full mt-2 text-sm font-semibold bg-gym-surface rounded-lg py-2 px-3 border border-gym-border focus:outline-none focus:border-gym-accent"
        >
          <option [ngValue]="null" disabled>Select an exercise…</option>
          @for (ex of exercises(); track ex.id) {
            <option [ngValue]="ex.id">{{ ex.name }} ({{ ex.category }})</option>
          }
        </select>
      </div>

      @if (errorMessage()) {
        <p class="text-xs text-red-500 text-center">{{ errorMessage() }}</p>
      } -->

      <!-- Per-exercise charts, shape depends on the selected exercise's type -->
      <!-- @switch (selectedExercise()?.exerciseType) {
        @case ('WeightTraining') {
          <app-chart-card
            title="Estimated 1-Rep Max"
            subtitle="Epley formula, top set per session"
            type="line"
            [data]="e1rmChartData()"
            [options]="lineOptions"
            [loading]="loadingExercise()"
          />
          <app-chart-card
            title="Heaviest Set vs Average Working Weight"
            type="line"
            [data]="heaviestVsAwwChartData()"
            [options]="dualAxisOptions"
            [loading]="loadingExercise()"
          />
        }
        @case ('Bodyweight') {
          <app-chart-card
            title="Volume Over Time"
            subtitle="sets × reps per session"
            type="line"
            [data]="bodyweightVolumeChartData()"
            [options]="areaOptions"
            [loading]="loadingExercise()"
          />
          <app-chart-card
            title="Max-Rep Set Ceiling"
            subtitle="highest unbroken rep count per session"
            type="line"
            [data]="maxRepChartData()"
            [options]="stepOptions"
            [loading]="loadingExercise()"
          />
        }
        @case ('Cardio') {
          <app-chart-card
            title="Pacing Output"
            [subtitle]="cardioSubtitle()"
            type="line"
            [data]="cardioChartData()"
            [options]="lineOptions"
            [loading]="loadingExercise()"
          />
        }
        @case ('BandTraining') {
          <app-chart-card
            title="Virtual Volume vs Weight Training Volume"
            subtitle="by month"
            type="bar"
            [data]="bandChartData()"
            [options]="groupedBarOptions"
            [loading]="loadingExercise()"
          />
        } 
      } -->
    </div>
  `,
})
export class AnalyticsDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);
  private exerciseService = inject(ExerciseService);

  readonly exercises = signal<ExerciseDto[]>([]);
  readonly selectedExerciseId = signal<string | null>(null);
  readonly selectedExercise = computed<ExerciseDto | undefined>(() =>
    this.exercises().find((e) => e.id === this.selectedExerciseId()),
  );

  readonly loadingSessionWide = signal(false);
  readonly loadingExercise = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // ── Raw data signals ─────────────────────────────────────────────────────
  private tonnageData = signal<TonnageEfficiencyPointDto[]>([]);
  private sessionCompositionData = signal<SessionCompositionPointDto[]>([]);
  private weightTrainingData = signal<WeightTrainingPointDto[]>([]);
  private bodyweightData = signal<BodyweightPointDto[]>([]);
  private cardioData = signal<CardioPointDto[]>([]);
  private bandData = signal<BandVolumePointDto[]>([]);

  ngOnInit(): void {
    this.loadExercises();
    this.loadSessionWideCharts();
  }

  private loadExercises(): void {
    this.exerciseService.getAll().subscribe({
      next: (list) => this.exercises.set(list),
      error: () => this.errorMessage.set("Couldn't load your exercise list."),
    });
  }

  private loadSessionWideCharts(): void {
    this.loadingSessionWide.set(true);
    forkJoin({
      tonnage: this.analyticsService.getTonnageEfficiency(),
      composition: this.analyticsService.getSessionComposition(),
    }).subscribe({
      next: ({ tonnage, composition }) => {
        this.tonnageData.set(tonnage);
        this.sessionCompositionData.set(composition);
        this.loadingSessionWide.set(false);
      },
      error: () => {
        this.errorMessage.set("Couldn't load analytics.");
        this.loadingSessionWide.set(false);
      },
    });
  }

  onExerciseSelected(exerciseId: string): void {
    this.selectedExerciseId.set(exerciseId);
    const exercise = this.selectedExercise();
    if (!exercise) return;

    this.errorMessage.set(null);
    this.loadingExercise.set(true);

    const done = () => this.loadingExercise.set(false);
    const fail = () => {
      this.errorMessage.set("Couldn't load analytics for this exercise.");
      this.loadingExercise.set(false);
    };

    switch (exercise.exerciseType as ExerciseType) {
      case 'WeightTraining':
        this.analyticsService.getWeightTraining(exerciseId).subscribe({
          next: (data) => {
            this.weightTrainingData.set(data);
            done();
          },
          error: fail,
        });
        break;
      case 'Bodyweight':
        this.analyticsService.getBodyweight(exerciseId).subscribe({
          next: (data) => {
            this.bodyweightData.set(data);
            done();
          },
          error: fail,
        });
        break;
      case 'Cardio':
        this.analyticsService.getCardio(exerciseId).subscribe({
          next: (data) => {
            this.cardioData.set(data);
            done();
          },
          error: fail,
        });
        break;
      case 'BandTraining':
        this.analyticsService.getBandTraining(exerciseId).subscribe({
          next: (data) => {
            this.bandData.set(data);
            done();
          },
          error: fail,
        });
        break;
    }
  }

  // ── Chart data builders ──────────────────────────────────────────────────

  readonly tonnageChartData = computed<ChartConfiguration['data']>(() => {
    const rows = this.tonnageData();
    return {
      labels: rows.map((r) => r.date),
      datasets: [
        {
          label: 'Tonnage per Minute (kg/min)',
          data: rows.map((r) => r.tonnagePerMinute),
          backgroundColor: getChartTheme().accent,
        },
      ],
    };
  });

  readonly sessionCompositionChartData = computed<ChartConfiguration['data']>(() => {
    const rows = this.sessionCompositionData();
    const latest = rows[rows.length - 1];
    if (!latest) return { labels: [], datasets: [] };
    return {
      labels: ['Cardio', 'Strength'],
      datasets: [
        {
          data: [latest.cardioMinutes, latest.strengthMinutes],
          backgroundColor: [getChartTheme().accent, getChartTheme().success],
        },
      ],
    };
  });

  readonly e1rmChartData = computed(() => buildE1rmChartData(this.weightTrainingData()));

  readonly heaviestVsAwwChartData = computed(() =>
    buildHeaviestVsAwwChartData(this.weightTrainingData()),
  );

  // NOTE: this is a single-exercise volume trend, not the multi-exercise
  // stacked area chart described in the spec (e.g. Pull-ups + Push-ups +
  // Dips stacked together). Stacking multiple exercises means fetching
  // this endpoint per exercise and merging the results client-side —
  // straightforward to add once you decide which exercises to group.
  readonly bodyweightVolumeChartData = computed(() =>
    buildBodyweightVolumeChartData(this.bodyweightData()),
  );

  readonly maxRepChartData = computed(() => buildMaxRepChartData(this.bodyweightData()));

  readonly cardioSubtitle = computed(() => buildCardioSubtitle(this.cardioData()));

  readonly cardioChartData = computed(() => buildCardioChartData(this.cardioData()));

  // Aggregated to per-month totals inside the builder, matching the
  // "monthly Virtual Volume vs absolute WeightTraining volume" spec.
  readonly bandChartData = computed(() => buildBandChartData(this.bandData()));

  // ── Chart.js option presets ──────────────────────────────────────────────

  readonly lineOptions = lineChartOptions;
  readonly areaOptions = lineChartOptions;
  readonly stepOptions = lineChartOptions;
  readonly barOptions = barChartOptions;
  readonly groupedBarOptions = groupedBarChartOptions;
  readonly doughnutOptions = doughnutChartOptions;
  readonly dualAxisOptions = dualAxisChartOptions;
}