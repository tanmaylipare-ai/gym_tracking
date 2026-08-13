import { ChartConfiguration } from 'chart.js';
import {
  WeightTrainingPointDto,
  BodyweightPointDto,
  CardioPointDto,
  BandVolumePointDto,
} from '../../core/models/models';

// ── Theme Resolution Helper ─────────────────────────────────────────────────

/** Resolves CSS variables to actual hex/rgb values required by HTML Canvas. */
export function getCssVar(varName: string, fallback = '#000000'): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

/** Fetches the active theme colors at the moment the chart is rendered. */
export function getChartTheme() {
  const accent = getCssVar('--primary', '#007595');
  const success = getCssVar('--success', '#16a34a');
  const muted = getCssVar('--muted-foreground', '#737373');

  return {
    accent,
    success,
    muted,
    // Adds 20% alpha opacity assuming hex colors (#00759533)
    accentAlpha: accent.startsWith('#') ? `${accent}33` : accent,
  };
}

export function buildE1rmChartData(
  rows: WeightTrainingPointDto[],
): ChartConfiguration['data'] {
  return {
    labels: rows.map((r) => r.date),
    datasets: [
      {
        label: 'e1RM (kg)',
        data: rows.map((r) => r.e1RM),
        borderColor: getChartTheme().accent,
        backgroundColor: getChartTheme().accent,
        tension: 0.3,
      },
    ],
  };
}

export function buildHeaviestVsAwwChartData(
  rows: WeightTrainingPointDto[],
): ChartConfiguration['data'] {
  return {
    labels: rows.map((r) => r.date),
    datasets: [
      {
        label: 'Heaviest Set (kg)',
        data: rows.map((r) => r.heaviestSetKg),
        borderColor: getChartTheme().accent,
        backgroundColor: getChartTheme().accent,
        yAxisID: 'y',
        tension: 0.3,
      },
      {
        label: 'Avg Working Weight (kg)',
        data: rows.map((r) => r.averageWorkingWeightKg),
        borderColor: getChartTheme().success,
        backgroundColor: getChartTheme().success,
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };
}

export function buildBodyweightVolumeChartData(
  rows: BodyweightPointDto[],
): ChartConfiguration['data'] {
  return {
    labels: rows.map((r) => r.date),
    datasets: [
      {
        label: 'Volume (sets × reps)',
        data: rows.map((r) => r.volume),
        borderColor: getChartTheme().accent,
        backgroundColor: `${getChartTheme().accent}33`,
        fill: true,
        tension: 0.3,
      },
    ],
  };
}

export function buildMaxRepChartData(
  rows: BodyweightPointDto[],
): ChartConfiguration['data'] {
  return {
    labels: rows.map((r) => r.date),
    datasets: [
      {
        label: 'Max Reps in a Single Set',
        data: rows.map((r) => r.maxRepsInSingleSet),
        borderColor: getChartTheme().success,
        backgroundColor: getChartTheme().success,
        stepped: true,
      },
    ],
  };
}

export function cardioSubtitle(rows: CardioPointDto[]): string {
  const hasDistance = rows.some((r) => r.distanceKm !== null);
  return hasDistance ? 'pace (sec/km)' : 'strides or strokes per minute';
}

export function buildCardioChartData(
  rows: CardioPointDto[],
): ChartConfiguration['data'] {
  const hasDistance = rows.some((r) => r.distanceKm !== null);
  return {
    labels: rows.map((r) => r.date),
    datasets: [
      {
        label: hasDistance ? 'Pace (sec/km)' : 'Rate (per min)',
        data: rows.map((r) => (hasDistance ? r.paceSecPerKm : r.ratePerMin)),
        borderColor: getChartTheme().accent,
        backgroundColor: getChartTheme().accent,
        tension: 0.3,
      },
    ],
  };
}

/** Aggregates per-date rows into per-month totals for the grouped bar. */
export function buildBandChartData(
  rows: BandVolumePointDto[],
): ChartConfiguration['data'] {
  const byMonth = new Map<string, { virtual: number; weight: number }>();
  for (const r of rows) {
    const month = r.date.slice(0, 7); // "YYYY-MM"
    const entry = byMonth.get(month) ?? { virtual: 0, weight: 0 };
    entry.virtual += r.virtualVolumeKg;
    entry.weight += r.weightTrainingVolumeKg;
    byMonth.set(month, entry);
  }
  const months = [...byMonth.keys()].sort();
  return {
    labels: months,
    datasets: [
      {
        label: 'Band Virtual Volume (kg)',
        data: months.map((m) => byMonth.get(m)!.virtual),
        backgroundColor: getChartTheme().accent,
      },
      {
        label: 'Weight Training Volume (kg)',
        data: months.map((m) => byMonth.get(m)!.weight),
        backgroundColor: getChartTheme().success,
      },
    ],
  };
}

// ── Chart.js option presets ────────────────────────────────────────────────

export const lineChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { ticks: { color: getChartTheme().muted } }, y: { ticks: { color: getChartTheme().muted } } },
};

export const barChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: { x: { ticks: { color: getChartTheme().muted } }, y: { ticks: { color: getChartTheme().muted } } },
};

export const groupedBarChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, labels: { color: getChartTheme().muted } } },
  scales: { x: { ticks: { color: getChartTheme().muted } }, y: { ticks: { color: getChartTheme().muted } } },
};

export const dualAxisChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, labels: { color: getChartTheme().muted } } },
  scales: {
    x: { ticks: { color: getChartTheme().muted } },
    y: {
      type: 'linear',
      position: 'left',
      ticks: { color: getChartTheme().muted },
      title: { display: true, text: 'Heaviest Set (kg)', color: getChartTheme().muted },
    },
    y1: {
      type: 'linear',
      position: 'right',
      ticks: { color: getChartTheme().muted },
      grid: { drawOnChartArea: false },
      title: { display: true, text: 'Avg Working Weight (kg)', color: getChartTheme().muted },
    },
  },
};

export const doughnutChartOptions: ChartConfiguration['options'] = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: true, position: 'bottom', labels: { color: getChartTheme().muted } } },
};