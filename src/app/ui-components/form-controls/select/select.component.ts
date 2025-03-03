import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  icon?: string;
}

export interface SelectValidation {
  required?: boolean;
  minSelected?: number;
  maxSelected?: number;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ],
  template: `
    <div class="select-container" [class.open]="isOpen">
      <div
        class="select-control"
        [class.disabled]="disabled"
        (click)="toggleDropdown()"
      >
        <div class="selected-value">
          <ng-container *ngIf="multiple; else singleValue">
            <div class="selected-tags" *ngIf="selectedOptions.length > 0">
              <div
                *ngFor="let option of selectedOptions"
                class="selected-tag"
              >
                <i *ngIf="option.icon" [class]="option.icon" class="mr-1"></i>
                {{ option.label }}
                <button
                  class="remove-tag"
                  (click)="removeOption(option, $event)"
                >×</button>
              </div>
            </div>
            <span *ngIf="selectedOptions.length === 0" class="placeholder">
              {{ placeholder }}
            </span>
          </ng-container>
          <ng-template #singleValue>
            <ng-container *ngIf="selectedOption; else placeholderTpl">
              <i *ngIf="selectedOption.icon" [class]="selectedOption.icon" class="mr-2"></i>
              {{ selectedOption.label }}
            </ng-container>
            <ng-template #placeholderTpl>
              <span class="placeholder">{{ placeholder }}</span>
            </ng-template>
          </ng-template>
        </div>
        <div class="select-arrow" [class.open]="isOpen">▼</div>
      </div>

      <div class="select-dropdown" *ngIf="isOpen">
        <div
          *ngFor="let option of options"
          class="select-option"
          [class.selected]="isSelected(option)"
          [class.disabled]="option.disabled"
          (click)="selectOption(option)"
        >
          <i *ngIf="option.icon" [class]="option.icon" class="mr-2"></i>
          {{ option.label }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .select-container {
      position: relative;
      width: 100%;
    }

    .select-control {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      background: white;
      cursor: pointer;
      user-select: none;
      min-height: 40px;
    }

    .select-control:hover:not(.disabled) {
      border-color: var(--color-primary);
    }

    .select-control.disabled {
      background: var(--color-surface-variant);
      cursor: not-allowed;
      opacity: 0.6;
    }

    .selected-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .placeholder {
      color: var(--color-text-secondary);
    }

    .select-arrow {
      margin-left: 8px;
      font-size: 12px;
      transition: transform 0.2s;
    }

    .select-arrow.open {
      transform: rotate(180deg);
    }

    .select-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      margin-top: 4px;
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      max-height: 200px;
      overflow-y: auto;
    }

    .select-option {
      padding: 8px 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .select-option:hover:not(.disabled) {
      background: var(--color-surface-variant);
    }

    .select-option.selected {
      background: var(--color-primary);
      color: white;
    }

    .select-option.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .selected-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      background: var(--color-surface-variant);
      border-radius: var(--border-radius);
      font-size: 14px;
    }

    .remove-tag {
      margin-left: 4px;
      font-size: 16px;
      line-height: 1;
      border: none;
      background: none;
      padding: 0 2px;
      cursor: pointer;
      color: var(--color-text-secondary);
    }

    .remove-tag:hover {
      color: var(--color-danger);
    }
  `]
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() multiple = false;
  @Input() validation: SelectValidation = {};

  isOpen = false;
  disabled = false;
  value: any = this.multiple ? [] : null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedOption(): SelectOption | undefined {
    return this.options.find(option => option.value === this.value);
  }

  get selectedOptions(): SelectOption[] {
    if (!this.multiple) return [];
    return this.options.filter(option => this.value.includes(option.value));
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.onTouched();
    }
  }

  isSelected(option: SelectOption): boolean {
    if (this.multiple) {
      return this.value.includes(option.value);
    }
    return this.value === option.value;
  }

  selectOption(option: SelectOption): void {
    if (this.disabled || option.disabled) return;

    if (this.multiple) {
      const index = this.value.indexOf(option.value);
      if (index === -1) {
        if (!this.validation.maxSelected || this.value.length < this.validation.maxSelected) {
          this.value = [...this.value, option.value];
        }
      } else {
        if (!this.validation.minSelected || this.value.length > this.validation.minSelected) {
          this.value = this.value.filter((v: any) => v !== option.value);
        }
      }
    } else {
      this.value = option.value;
      this.isOpen = false;
    }

    this.onChange(this.value);
  }

  removeOption(option: SelectOption, event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled || option.disabled) return;
    
    if (!this.validation.minSelected || this.value.length > this.validation.minSelected) {
      this.value = this.value.filter((v: any) => v !== option.value);
      this.onChange(this.value);
    }
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