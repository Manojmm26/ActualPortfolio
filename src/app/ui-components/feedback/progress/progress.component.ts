import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-label" *ngIf="label">
        <span>{{ label }}</span>
        <span>{{ value }}%</span>
      </div>
      <div
        class="progress-bar"
        [class.striped]="striped"
        [class.animated]="animated"
        [class.success]="type === 'success'"
        [class.warning]="type === 'warning'"
        [class.error]="type === 'error'"
        [class.info]="type === 'info'"
      >
        <div
          class="progress-value"
          [style.width.%]="value"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .progress-container {
      width: 100%;
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
      color: var(--color-text);
    }

    .progress-bar {
      height: 8px;
      background: var(--color-surface-variant);
      border-radius: var(--border-radius);
      overflow: hidden;
    }

    .progress-value {
      height: 100%;
      background: var(--color-primary);
      transition: width 0.3s ease;
    }

    .progress-bar.success .progress-value {
      background: var(--color-success);
    }

    .progress-bar.warning .progress-value {
      background: var(--color-warning);
    }

    .progress-bar.error .progress-value {
      background: var(--color-danger);
    }

    .progress-bar.info .progress-value {
      background: var(--color-info);
    }

    .progress-bar.striped .progress-value {
      background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
      );
      background-size: 1rem 1rem;
    }

    .progress-bar.animated .progress-value {
      animation: progress-bar-stripes 1s linear infinite;
    }

    @keyframes progress-bar-stripes {
      from {
        background-position: 1rem 0;
      }
      to {
        background-position: 0 0;
      }
    }
  `]
})
export class ProgressComponent {
  @Input() value = 0;
  @Input() type: 'success' | 'warning' | 'error' | 'info' = 'info';
  @Input() label = '';
  @Input() striped = false;
  @Input() animated = false;
} 