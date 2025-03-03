import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface SelectButtonOption {
  label: string;
  value: any;
  icon?: string;
  disabled?: boolean;
  [key: string]: any;
}

@Component({
  selector: 'ui-select-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-select-button" [class.focused]="focused">
      <label *ngIf="label" class="select-button-label" [class.required]="required">
        {{ label }}
      </label>

      <div class="button-group"
           role="group"
           [attr.aria-label]="label"
           [class.disabled]="disabled">
        <button *ngFor="let option of options; let i = index"
                type="button"
                class="option-button"
                [class.selected]="isSelected(option)"
                [class.disabled]="option.disabled || disabled"
                [attr.aria-pressed]="isSelected(option)"
                [attr.aria-disabled]="option.disabled || disabled"
                (click)="onOptionClick(option)"
                (keydown)="onKeyDown($event, i)">
          <i *ngIf="option.icon" class="option-icon" [class]="option.icon"></i>
          <span class="option-label">{{ option.label }}</span>
        </button>
      </div>

      <!-- Hint/Error Messages -->
      <div *ngIf="hint" class="select-button-hint">{{ hint }}</div>
      <div *ngIf="error" class="select-button-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./select-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectButtonComponent),
      multi: true
    }
  ]
})
export class SelectButtonComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() multiple = false;
  @Input() options: SelectButtonOption[] = [];

  @Output() optionSelect = new EventEmitter<SelectButtonOption>();
  @Output() optionUnselect = new EventEmitter<SelectButtonOption>();
  @Output() change = new EventEmitter<any>();

  focused = false;
  selectedOptions: SelectButtonOption[] = [];

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  onOptionClick(option: SelectButtonOption): void {
    if (option.disabled || this.disabled) return;

    if (this.multiple) {
      this.toggleOption(option);
    } else {
      this.selectOption(option);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousOption(index);
        break;
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextOption(index);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onOptionClick(this.options[index]);
        break;
    }
  }

  private focusNextOption(currentIndex: number): void {
    let nextIndex = currentIndex;
    do {
      nextIndex = (nextIndex + 1) % this.options.length;
    } while (this.options[nextIndex].disabled && nextIndex !== currentIndex);

    if (!this.options[nextIndex].disabled) {
      const buttons = this.getOptionButtons();
      buttons[nextIndex]?.focus();
    }
  }

  private focusPreviousOption(currentIndex: number): void {
    let prevIndex = currentIndex;
    do {
      prevIndex = (prevIndex - 1 + this.options.length) % this.options.length;
    } while (this.options[prevIndex].disabled && prevIndex !== currentIndex);

    if (!this.options[prevIndex].disabled) {
      const buttons = this.getOptionButtons();
      buttons[prevIndex]?.focus();
    }
  }

  private getOptionButtons(): HTMLButtonElement[] {
    return Array.from(document.querySelectorAll('.option-button'));
  }

  private toggleOption(option: SelectButtonOption): void {
    const index = this.selectedOptions.findIndex(o => o.value === option.value);
    if (index === -1) {
      this.selectedOptions = [...this.selectedOptions, option];
      this.optionSelect.emit(option);
    } else {
      this.selectedOptions = this.selectedOptions.filter(o => o.value !== option.value);
      this.optionUnselect.emit(option);
    }
    this.updateValue();
  }

  private selectOption(option: SelectButtonOption): void {
    this.selectedOptions = [option];
    this.optionSelect.emit(option);
    this.updateValue();
  }

  private updateValue(): void {
    const value = this.multiple
      ? this.selectedOptions.map(o => o.value)
      : this.selectedOptions[0]?.value;
    this.onChange(value);
    this.change.emit(value);
  }

  isSelected(option: SelectButtonOption): boolean {
    return this.selectedOptions.some(o => o.value === option.value);
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    if (this.multiple && Array.isArray(value)) {
      this.selectedOptions = this.options.filter(o =>
        value.includes(o.value)
      );
    } else if (value !== undefined && value !== null) {
      const option = this.options.find(o => o.value === value);
      this.selectedOptions = option ? [option] : [];
    } else {
      this.selectedOptions = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 