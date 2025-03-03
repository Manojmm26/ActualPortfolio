import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-input-number',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-input-number" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="value !== null">
        <div class="input-wrapper">
          <button *ngIf="showButtons"
                  type="button"
                  class="spinner-button decrease"
                  [disabled]="isDecrementDisabled()"
                  (click)="decrement()"
                  aria-label="Decrease value">
            <span aria-hidden="true">-</span>
          </button>

          <input
            #input
            type="text"
            [value]="displayValue"
            [placeholder]="floatingLabel ? ' ' : placeholder"
            [disabled]="disabled"
            [required]="required"
            [attr.min]="min"
            [attr.max]="max"
            [attr.step]="step"
            [attr.autocomplete]="autocomplete"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown)="onKeyDown($event)"
            class="input-field"
          />

          <button *ngIf="showButtons"
                  type="button"
                  class="spinner-button increase"
                  [disabled]="isIncrementDisabled()"
                  (click)="increment()"
                  aria-label="Increase value">
            <span aria-hidden="true">+</span>
          </button>
        </div>

        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>

        <div *ngIf="prefix || suffix" class="affixes">
          <span *ngIf="prefix" class="prefix">{{ prefix }}</span>
          <span *ngIf="suffix" class="suffix">{{ suffix }}</span>
        </div>

        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true
    }
  ]
})
export class InputNumberComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() min?: number;
  @Input() max?: number;
  @Input() step = 1;
  @Input() precision = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() showButtons = true;
  @Input() locale = 'en-US';
  @Input() autocomplete = 'off';

  value: number | null = null;
  focused = false;
  displayValue = '';

  private onChange: (value: number | null) => void = () => {};
  private onTouched: () => void = () => {};

  get formattedValue(): string {
    if (this.value === null) return '';
    return this.formatNumber(this.value);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: this.precision,
      maximumFractionDigits: this.precision
    }).format(value);
  }

  private parseNumber(value: string): number | null {
    const normalized = value
      .replace(new RegExp(`[^\\d${this.precision ? '.' : ''}\\-]`, 'g'), '')
      .replace(/^(-)?0+(?=\d)/, '$1');

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : parsed;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;
    const parsedValue = this.parseNumber(rawValue);

    if (parsedValue !== null) {
      const clampedValue = this.clampValue(parsedValue);
      this.value = clampedValue;
      this.displayValue = this.formatNumber(clampedValue);
      this.onChange(clampedValue);
    } else {
      this.value = null;
      this.displayValue = rawValue;
      this.onChange(null);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.increment();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.decrement();
    }
  }

  onFocus(): void {
    this.focused = true;
    this.displayValue = this.value?.toString() || '';
    this.onTouched();
  }

  onBlur(): void {
    this.focused = false;
    this.displayValue = this.formattedValue;
  }

  increment(): void {
    if (this.disabled || this.isIncrementDisabled()) return;
    const newValue = (this.value || 0) + this.step;
    this.updateValue(newValue);
  }

  decrement(): void {
    if (this.disabled || this.isDecrementDisabled()) return;
    const newValue = (this.value || 0) - this.step;
    this.updateValue(newValue);
  }

  isIncrementDisabled(): boolean {
    return this.max !== undefined && this.value !== null && this.value >= this.max;
  }

  isDecrementDisabled(): boolean {
    return this.min !== undefined && this.value !== null && this.value <= this.min;
  }

  private clampValue(value: number): number {
    let clampedValue = value;
    if (this.min !== undefined) clampedValue = Math.max(this.min, clampedValue);
    if (this.max !== undefined) clampedValue = Math.min(this.max, clampedValue);
    return Number(clampedValue.toFixed(this.precision));
  }

  private updateValue(value: number): void {
    const clampedValue = this.clampValue(value);
    this.value = clampedValue;
    this.displayValue = this.formatNumber(clampedValue);
    this.onChange(clampedValue);
  }

  // ControlValueAccessor implementation
  writeValue(value: number | null): void {
    this.value = value;
    this.displayValue = this.formattedValue;
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