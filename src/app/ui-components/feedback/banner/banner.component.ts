import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="banner"
      [class.success]="type === 'success'"
      [class.warning]="type === 'warning'"
      [class.error]="type === 'error'"
      [class.info]="type === 'info'"
    >
      <div class="banner-content">
        <i *ngIf="icon" [class]="icon" class="banner-icon"></i>
        <div class="banner-text">
          <h4 *ngIf="title" class="banner-title">{{ title }}</h4>
          <p class="banner-message">{{ message }}</p>
        </div>
      </div>
      <button *ngIf="dismissible" class="banner-close" (click)="onDismiss()">×</button>
    </div>
  `,
  styles: [`
    .banner {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 16px;
      border-radius: var(--border-radius);
      margin-bottom: 16px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
    }

    .banner.success {
      background: var(--color-success-light);
      border-color: var(--color-success);
      color: var(--color-success-dark);
    }

    .banner.warning {
      background: var(--color-warning-light);
      border-color: var(--color-warning);
      color: var(--color-warning-dark);
    }

    .banner.error {
      background: var(--color-danger-light);
      border-color: var(--color-danger);
      color: var(--color-danger-dark);
    }

    .banner.info {
      background: var(--color-info-light);
      border-color: var(--color-info);
      color: var(--color-info-dark);
    }

    .banner-content {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .banner-icon {
      font-size: 20px;
    }

    .banner-text {
      flex: 1;
    }

    .banner-title {
      font-size: 16px;
      font-weight: 500;
      margin: 0 0 4px 0;
    }

    .banner-message {
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }

    .banner-close {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      padding: 0 4px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .banner-close:hover {
      opacity: 1;
    }
  `]
})
export class BannerComponent {
  @Input() type: 'success' | 'warning' | 'error' | 'info' = 'info';
  @Input() title = '';
  @Input() message = 'This is a banner message';
  @Input() icon = '';
  @Input() dismissible = true;

  onDismiss(): void {
    // Emit dismiss event or handle dismissal logic
  }
} 