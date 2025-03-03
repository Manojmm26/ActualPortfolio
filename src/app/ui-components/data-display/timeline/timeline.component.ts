import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TimelineItem {
  id: string | number;
  title: string;
  content: string;
  date: string;
  icon?: string;
  color?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="timeline-container"
      [class.vertical]="layout === 'vertical'"
      [class.horizontal]="layout === 'horizontal'"
      [class.alternate]="alternate && layout === 'vertical'"
    >
      <div class="timeline-items">
        <div
          *ngFor="let item of items; let i = index"
          class="timeline-item"
          [class.left]="alternate && layout === 'vertical' && i % 2 === 0"
          [class.right]="alternate && layout === 'vertical' && i % 2 === 1"
          [style.--item-color]="item.color || getStatusColor(item.status)"
        >
          <!-- Timeline Marker -->
          <div class="timeline-marker">
            <div class="marker-dot">
              <i *ngIf="item.icon" [class]="item.icon"></i>
            </div>
            <div class="marker-line"></div>
          </div>

          <!-- Timeline Content -->
          <div class="timeline-content">
            <div class="content-header">
              <h3 class="title">{{ item.title }}</h3>
              <span class="date">{{ item.date }}</span>
            </div>
            <div class="content-body">
              {{ item.content }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .timeline-container {
      position: relative;
      padding: 20px;
    }

    .timeline-container.vertical {
      padding-left: 40px;
    }

    .timeline-container.horizontal {
      padding-top: 40px;
    }

    .timeline-items {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .horizontal .timeline-items {
      flex-direction: row;
      align-items: flex-start;
      overflow-x: auto;
      padding-bottom: 20px;
    }

    .timeline-item {
      position: relative;
      --item-color: var(--color-primary);
    }

    .vertical .timeline-item {
      padding-left: 32px;
    }

    .horizontal .timeline-item {
      padding-top: 32px;
      flex: 1;
      min-width: 200px;
    }

    /* Marker Styles */
    .timeline-marker {
      position: absolute;
      display: flex;
    }

    .vertical .timeline-marker {
      left: -40px;
      top: 0;
      bottom: 0;
      flex-direction: column;
      align-items: center;
    }

    .horizontal .timeline-marker {
      top: -40px;
      left: 0;
      right: 0;
      flex-direction: row;
      justify-content: center;
    }

    .marker-dot {
      width: 24px;
      height: 24px;
      background: white;
      border: 2px solid var(--item-color);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;
    }

    .marker-dot i {
      font-size: 12px;
      color: var(--item-color);
    }

    .marker-line {
      background: var(--item-color);
      opacity: 0.3;
    }

    .vertical .marker-line {
      width: 2px;
      flex: 1;
    }

    .horizontal .marker-line {
      height: 2px;
      flex: 1;
    }

    /* Content Styles */
    .timeline-content {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      padding: 16px;
    }

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 8px;
    }

    .title {
      font-size: 16px;
      font-weight: 500;
      color: var(--color-text);
      margin: 0;
    }

    .date {
      font-size: 14px;
      color: var(--color-text-secondary);
      white-space: nowrap;
    }

    .content-body {
      color: var(--color-text);
      font-size: 14px;
      line-height: 1.5;
    }

    /* Alternating Layout */
    .alternate .timeline-item {
      width: calc(50% - 40px);
    }

    .alternate .timeline-item.left {
      align-self: flex-start;
      padding-right: 32px;
    }

    .alternate .timeline-item.right {
      align-self: flex-end;
      padding-left: 32px;
    }

    .alternate .timeline-item.left .timeline-marker {
      right: -40px;
      left: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .alternate .timeline-item {
        width: auto;
        align-self: flex-start !important;
        padding-left: 32px !important;
        padding-right: 0 !important;
      }

      .alternate .timeline-item .timeline-marker {
        left: -40px !important;
        right: auto !important;
      }
    }
  `]
})
export class TimelineComponent {
  @Input() items: TimelineItem[] = [];
  @Input() layout: 'vertical' | 'horizontal' = 'vertical';
  @Input() alternate = false;

  getStatusColor(status?: 'success' | 'warning' | 'error' | 'info'): string {
    switch (status) {
      case 'success':
        return 'var(--color-success)';
      case 'warning':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-danger)';
      case 'info':
        return 'var(--color-info)';
      default:
        return 'var(--color-primary)';
    }
  }
} 