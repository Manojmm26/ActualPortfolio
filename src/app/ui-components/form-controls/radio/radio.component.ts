import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface RadioOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioComponent),
      multi: true
    }
  ],
  template: `
    <div class="radio-group" [class.vertical]="vertical">
      <div
        *ngFor="let option of options"
        class="radio-option"
        [class.disabled]="option.disabled"
        (click)="onSelect(option)"
      >
        <div class="radio-control">
          <div class="radio-circle" [class.checked]="isSelected(option)">
            <div class="radio-dot" *ngIf="isSelected(option)"></div>
          </div>
          <div class="radio-content">
            <div class="radio-label">
              <i *ngIf="option.icon" [class]="option.icon" class="mr-2"></i>
              {{ option.label }}
            </div>
            <div *ngIf="option.description" class="radio-description">
              {{ option.description }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .radio-group {
      display: flex;
      gap: 12px;
    }

    .radio-group.vertical {
      flex-direction: column;
    }

    .radio-option {
      cursor: pointer;
      user-select: none;
    }

    .radio-option.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .radio-control {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .radio-circle {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: border-color 0.2s;
    }

    .radio-circle.checked {
      border-color: var(--color-primary);
    }

    .radio-dot {
      width: 10px;
      height: 10px;
      background: var(--color-primary);
      border-radius: 50%;
    }

    .radio-content {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .radio-label {
      display: flex;
      align-items: center;
      color: var(--color-text);
      font-size: 16px;
    }

    .radio-description {
      color: var(--color-text-secondary);
      font-size: 14px;
    }
  `]
})
export class RadioComponent implements ControlValueAccessor {
  @Input() options: RadioOption[] = [];
  @Input() vertical = false;

  value: any = null;
  disabled = false;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  isSelected(option: RadioOption): boolean {
    return this.value === option.value;
  }

  onSelect(option: RadioOption): void {
    if (this.disabled || option.disabled) {
      return;
    }

    this.value = option.value;
    this.onChange(this.value);
    this.onTouched();
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 