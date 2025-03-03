import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Alert {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  dismissible?: boolean;
}

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alerts-container">
      <div *ngFor="let alert of alerts" 
           class="alert" 
           [class]="'alert-' + alert.type"
           [class.dismissible]="alert.dismissible">
        <div class="alert-content">
          <h4 *ngIf="alert.title" class="alert-title">{{ alert.title }}</h4>
          <p class="alert-message">{{ alert.message }}</p>
        </div>
        <button *ngIf="alert.dismissible" 
                class="alert-dismiss" 
                (click)="removeAlert(alert)">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .alerts-container {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .alert {
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--spacing-md);
    }

    .alert-content {
      flex: 1;
    }

    .alert-title {
      font-weight: 600;
      margin-bottom: var(--spacing-xs);
    }

    .alert-message {
      margin: 0;
    }

    .alert-dismiss {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s;
      padding: 0;
      margin: -0.5rem -0.25rem 0 0;

      &:hover {
        opacity: 1;
      }
    }

    .alert-info {
      background-color: var(--color-info-light);
      border: 1px solid var(--color-info);
      color: var(--color-info-dark);
    }

    .alert-success {
      background-color: var(--color-success-light);
      border: 1px solid var(--color-success);
      color: var(--color-success-dark);
    }

    .alert-warning {
      background-color: var(--color-warning-light);
      border: 1px solid var(--color-warning);
      color: var(--color-warning-dark);
    }

    .alert-error {
      background-color: var(--color-danger-light);
      border: 1px solid var(--color-danger);
      color: var(--color-danger-dark);
    }
  `]
})
export class AlertsComponent {
  @Input() alerts: Alert[] = [
    {
      type: 'info',
      title: 'Information',
      message: 'This is an informational alert',
      dismissible: true
    },
    {
      type: 'success',
      message: 'Operation completed successfully',
      dismissible: true
    },
    {
      type: 'warning',
      title: 'Warning',
      message: 'Please review your input before proceeding',
      dismissible: true
    },
    {
      type: 'error',
      title: 'Error',
      message: 'An error occurred while processing your request',
      dismissible: true
    }
  ];

  removeAlert(alert: Alert): void {
    const index = this.alerts.indexOf(alert);
    if (index > -1) {
      this.alerts.splice(index, 1);
    }
  }
} 