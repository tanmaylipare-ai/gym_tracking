import {
  Component,
  Input,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { getChartTheme } from '../../shared/utils/analytics-chart-builders';

/**
 * Thin presentational wrapper around ng2-charts' BaseChartDirective.
 * Renders a titled card, an empty-state message when there's no data,
 * or the chart itself. Listens for runtime theme switches (light/dark mode)
 * to automatically update Chart.js canvas colors.
 */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="card rounded-2xl p-4 bg-gym-card border border-gym-border">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-bold text-gym-fg">{{ title }}</h3>
        @if (subtitle) {
          <span class="text-xs text-gym-muted">{{ subtitle }}</span>
        }
      </div>

      @if (loading) {
        <p class="text-xs text-gym-muted text-center py-8">Loading…</p>
      } @else if (isEmpty) {
        <p class="text-xs text-gym-muted text-center py-8">
          Not enough logged data yet for this chart.
        </p>
      } @else {
        <div class="h-56">
          <canvas
            baseChart
            [type]="type"
            [data]="data"
            [options]="options"
          ></canvas>
        </div>
      }
    </div>
  `,
})
export class ChartCardComponent implements OnInit, OnDestroy {
  @ViewChild(BaseChartDirective) chartDirective?: BaseChartDirective;

  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
  @Input({ required: true }) type!: ChartType;
  @Input({ required: true }) data!: ChartConfiguration['data'];
  @Input() options: ChartConfiguration['options'] = {};
  @Input() loading = false;

  private themeObserver?: MutationObserver;

  ngOnInit(): void {
    this.observeThemeChanges();
  }

  ngOnDestroy(): void {
    this.themeObserver?.disconnect();
  }

  get isEmpty(): boolean {
    const datasets = this.data?.datasets ?? [];
    return (
      datasets.length === 0 ||
      datasets.every((d) => !d.data || d.data.length === 0)
    );
  }

  /**
   * Listens for class changes on <html> (e.g., toggling .dark mode)
   * and triggers a Chart.js update so canvas elements repaint instantly.
   */
  private observeThemeChanges(): void {
    if (typeof window === 'undefined') return;

    this.themeObserver = new MutationObserver(() => {
      if (this.chartDirective?.chart) {
        const theme = getChartTheme();

        // Update tick colors dynamically across all axes
        if (this.options?.scales) {
          Object.values(this.options.scales).forEach((scale) => {
            if (scale?.ticks) {
              scale.ticks.color = theme.muted;
            }
          });
        }

        // Repaint canvas without full reset animation
        this.chartDirective.chart.update('none');
      }
    });

    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
}