import { Component, OnInit, OnDestroy } from '@angular/core';
import { PerformanceService, PerformanceMetrics } from '../../services/performance.service';
import { ProjectService } from '../../services/project.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { CommonModule, DecimalPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, DecimalPipe, PercentPipe],
  template: `
    <section class="performance-section">
      <div class="container">
        <h2 class="section-title">Performance Metrics</h2>

        <div class="metrics-grid">
          <!-- Core Web Vitals -->
          <div class="metric-card">
            <h3>Core Web Vitals</h3>
            <div class="metric-value" [class.good]="((metrics$ | async)?.lcp || 0) <= 2500">
              LCP: {{ ((metrics$ | async)?.lcp || 0) | number:'1.0-0' }}ms
            </div>
            <div class="metric-value" [class.good]="((metrics$ | async)?.fid || 0) <= 100">
              FID: {{ ((metrics$ | async)?.fid || 0) | number:'1.0-0' }}ms
            </div>
            <div class="metric-value" [class.good]="((metrics$ | async)?.cls || 0) <= 0.1">
              CLS: {{ ((metrics$ | async)?.cls || 0) | number:'1.2-2' }}
            </div>
          </div>

          <!-- Resource Metrics -->
          <div class="metric-card">
            <h3>Resource Usage</h3>
            <div class="metric-value">
              JS Heap: {{ ((metrics$ | async)?.jsHeapSize || 0) / 1024 / 1024 | number:'1.0-1' }}MB
            </div>
            <div class="metric-value">
              DOM Nodes: {{ (metrics$ | async)?.domNodes || 0 }}
            </div>
            <div class="metric-value">
              Resources: {{ (metrics$ | async)?.resourceCount || 0 }}
            </div>
          </div>

          <!-- Lighthouse Score -->
          <div class="metric-card">
            <h3>Lighthouse Score</h3>
            <div class="lighthouse-score">
              {{ lighthouseScore$ | async | number:'1.0-0' }}
            </div>
            <div class="score-label">
              Overall Performance
            </div>
          </div>
        </div>

        <div class="project-metrics">
          <h3>Project Performance History</h3>
          <table class="metrics-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Load Time</th>
                <th>Error Rate</th>
                <th>Test Coverage</th>
                <th>Bundle Size</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let project of projects$ | async">
                <td>{{ project.title }}</td>
                <td [class.good]="project.metrics.loadTime < 1">
                  {{ project.metrics.loadTime }}s
                </td>
                <td [class.good]="project.metrics.errorRate < 0.01">
                  {{ project.metrics.errorRate | percent:'1.2-2' }}
                </td>
                <td [class.good]="project.metrics.testCoverage > 90">
                  {{ project.metrics.testCoverage }}%
                </td>
                <td [class.good]="project.metrics.bundleSize < 200">
                  {{ project.metrics.bundleSize }}KB
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .performance-section {
      padding: 80px 0;
      background: #121212;
      min-height: 100vh;
      color: #ffffff;
    }

    .section-title {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 40px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
      margin-bottom: 60px;
    }

    @media (max-width: 960px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 600px) {
      .metrics-grid {
        grid-template-columns: 1fr;
      }
    }

    .metric-card {
      background: #1a1a1a;
      border-radius: 10px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

      h3 {
        color: #4CAF50;
        margin-bottom: 20px;
        font-size: 1.2rem;
      }
    }

    .metric-value {
      font-size: 1.1rem;
      margin-bottom: 10px;
      padding: 8px;
      border-radius: 5px;
      background: #2a2a2a;

      &.good {
        color: #4CAF50;
      }
    }

    .lighthouse-score {
      font-size: 3rem;
      font-weight: bold;
      color: #4CAF50;
      text-align: center;
      margin: 20px 0;
    }

    .score-label {
      text-align: center;
      color: #a8a8a8;
    }

    .project-metrics {
      display: flex;
      flex-direction: column;
      gap: 30px;

      h3 {
        color: #4CAF50;
        font-size: 1.5rem;
        margin-bottom: 20px;
      }
    }

    .metrics-table {
      width: 100%;
      border-collapse: collapse;
      background: #1a1a1a;
      border-radius: 10px;
      overflow: hidden;

      th, td {
        padding: 15px;
        text-align: left;
        border-bottom: 1px solid #2a2a2a;
      }

      th {
        background: #2a2a2a;
        color: #4CAF50;
        font-weight: 500;
      }

      td {
        &.good {
          color: #4CAF50;
        }
      }

      tr:last-child td {
        border-bottom: none;
      }
    }
  `],
  animations: [
    trigger('metricsAnimation', [
      transition(':enter', [
        query('.metric-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class PerformanceComponent implements OnInit, OnDestroy {
  metrics$ = new Observable<{
    lcp: number;
    fid: number;
    cls: number;
    jsHeapSize: number;
    domNodes: number;
    resourceCount: number;
  }>();

  lighthouseScore$ = new Observable<number>();

  projects = [
    {
      name: 'Project 1',
      metrics: {
        errorRate: 0.02
      }
    }
  ];

  projects$: Observable<any[]>;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private performanceService: PerformanceService,
    private projectService: ProjectService
  ) {
    this.metrics$ = this.performanceService.getMetrics();
    this.projects$ = this.projectService.getProjects();
    this.lighthouseScore$ = this.performanceService.getLighthouseScore();
  }

  ngOnInit(): void {
    // Initialize metrics
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
} 