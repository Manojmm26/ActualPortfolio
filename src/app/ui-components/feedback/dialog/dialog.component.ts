import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" *ngIf="visible" (click)="onOverlayClick($event)">
      <div class="dialog" [class.sm]="size === 'small'" [class.lg]="size === 'large'">
        <!-- Header -->
        <div class="dialog-header">
          <h3 class="dialog-title">{{ title }}</h3>
          <button class="dialog-close" (click)="close()">×</button>
        </div>

        <!-- Content -->
        <div class="dialog-content">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <div class="dialog-footer" *ngIf="showFooter">
          <button
            class="btn btn-secondary"
            *ngIf="showCancel"
            (click)="cancel()"
          >
            {{ cancelText }}
          </button>
          <button
            class="btn btn-primary"
            *ngIf="showConfirm"
            (click)="confirm()"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .dialog {
      background: white;
      border-radius: var(--border-radius);
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 500px;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .dialog.sm {
      width: 300px;
    }

    .dialog.lg {
      width: 800px;
    }

    .dialog-header {
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .dialog-title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .dialog-close {
      background: none;
      border: none;
      font-size: 24px;
      line-height: 1;
      padding: 0 4px;
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .dialog-close:hover {
      opacity: 1;
    }

    .dialog-content {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }

    .dialog-footer {
      padding: 16px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: var(--border-radius);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background: var(--color-primary);
      color: white;
    }

    .btn-primary:hover {
      background: var(--color-primary-dark);
    }

    .btn-secondary {
      background: var(--color-surface-variant);
      color: var(--color-text);
    }

    .btn-secondary:hover {
      background: var(--color-surface-variant-dark);
    }
  `]
})
export class DialogComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showFooter = true;
  @Input() showCancel = true;
  @Input() showConfirm = true;
  @Input() cancelText = 'Cancel';
  @Input() confirmText = 'Confirm';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<void>();

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('dialog-overlay')) {
      this.close();
    }
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
  }

  cancel(): void {
    this.cancelled.emit();
    this.close();
  }

  confirm(): void {
    this.confirmed.emit();
    this.close();
  }
} 