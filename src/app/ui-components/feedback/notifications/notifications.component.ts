import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  icon?: string;
  autoClose?: boolean;
  duration?: number;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div *ngFor="let notification of notifications"
           class="notification"
           [class]="'notification-' + notification.type"
           [@slideIn]>
        <div class="notification-icon" *ngIf="notification.icon">
          <i [class]="notification.icon"></i>
        </div>
        <div class="notification-content">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <p class="notification-message">{{ notification.message }}</p>
        </div>
        <button class="notification-close" (click)="removeNotification(notification)">
          ×
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: var(--spacing-lg);
      right: var(--spacing-lg);
      z-index: var(--z-index-notifications);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      max-width: 400px;
      width: calc(100% - var(--spacing-lg) * 2);
    }

    .notification {
      padding: var(--spacing-md);
      border-radius: var(--border-radius);
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      animation: slideIn 0.3s ease-out;
    }

    .notification-icon {
      font-size: 1.25rem;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      margin: 0 0 var(--spacing-xs);
    }

    .notification-message {
      margin: 0;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .notification-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      line-height: 1;
      cursor: pointer;
      opacity: 0.7;
      padding: 0;
      margin: -0.25rem -0.25rem 0 0;
      transition: opacity 0.2s;

      &:hover {
        opacity: 1;
      }
    }

    .notification-info {
      border-left: 4px solid var(--color-info);
      .notification-icon { color: var(--color-info); }
    }

    .notification-success {
      border-left: 4px solid var(--color-success);
      .notification-icon { color: var(--color-success); }
    }

    .notification-warning {
      border-left: 4px solid var(--color-warning);
      .notification-icon { color: var(--color-warning); }
    }

    .notification-error {
      border-left: 4px solid var(--color-danger);
      .notification-icon { color: var(--color-danger); }
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent {
  @Input() notifications: Notification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Success',
      message: 'Your changes have been saved successfully',
      icon: 'fas fa-check-circle',
      autoClose: true,
      duration: 5000
    },
    {
      id: '2',
      type: 'info',
      title: 'New Message',
      message: 'You have received a new message',
      icon: 'fas fa-envelope',
      autoClose: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'Warning',
      message: 'Your session will expire in 5 minutes',
      icon: 'fas fa-exclamation-triangle',
      autoClose: true,
      duration: 10000
    }
  ];

  removeNotification(notification: Notification): void {
    const index = this.notifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  ngOnInit(): void {
    // Set up auto-close for notifications
    this.notifications.forEach(notification => {
      if (notification.autoClose && notification.duration) {
        setTimeout(() => {
          this.removeNotification(notification);
        }, notification.duration);
      }
    });
  }
} 