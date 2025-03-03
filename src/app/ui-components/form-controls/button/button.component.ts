import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      [class]="buttonClasses"
      (click)="onClick($event)"
    >
      <i *ngIf="icon" [class]="icon" class="mr-2"></i>
      {{ label }}
    </button>
  `,
  styles: [`
    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: var(--border-radius);
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      outline: none;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Variants */
    .primary {
      background: var(--color-primary);
      color: white;
    }

    .primary:hover:not(:disabled) {
      background: var(--color-primary-dark);
    }

    .secondary {
      background: var(--color-secondary);
      color: white;
    }

    .secondary:hover:not(:disabled) {
      background: var(--color-secondary-dark);
    }

    .outline {
      background: transparent;
      border: 2px solid var(--color-primary);
      color: var(--color-primary);
    }

    .outline:hover:not(:disabled) {
      background: var(--color-primary);
      color: white;
    }

    /* Sizes */
    .small {
      padding: 6px 12px;
      font-size: 14px;
    }

    .large {
      padding: 12px 24px;
      font-size: 18px;
    }
  `]
})
export class ButtonComponent {
  @Input() label = '';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() icon = '';
  @Input() disabled = false;

  @Output() click = new EventEmitter<MouseEvent>();

  get buttonClasses(): string {
    return [
      this.variant,
      this.size,
      this.disabled ? 'disabled' : ''
    ].filter(Boolean).join(' ');
  }

  onClick(event: MouseEvent): void {
    if (!this.disabled) {
      this.click.emit(event);
    }
  }
} 