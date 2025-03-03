import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface InputValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: string) => boolean;
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="input-container">
      <input
        [type]="type"
        [formControl]="control"
        [class.error]="hasError"
        [placeholder]="placeholder"
        (blur)="handleBlur()"
      />
      <div class="error-message" *ngIf="hasError">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    input {
      padding: 8px 12px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      font-size: 16px;
      outline: none;
      transition: border-color 0.2s;
    }

    input:focus {
      border-color: var(--color-primary);
    }

    input.error {
      border-color: var(--color-danger);
    }

    .error-message {
      color: var(--color-danger);
      font-size: 14px;
    }
  `]
})
export class InputComponent implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() validation: InputValidation = {};
  
  control = new FormControl<string>('');
  
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  handleBlur(): void {
    this.onTouched();
  }

  get hasError(): boolean {
    if (!this.control.touched) return false;
    
    const value = this.control.value || '';
    
    if (this.validation.required && !value) {
      return true;
    }
    
    if (this.validation.minLength && value.length < this.validation.minLength) {
      return true;
    }
    
    if (this.validation.maxLength && value.length > this.validation.maxLength) {
      return true;
    }
    
    if (this.validation.pattern && !new RegExp(this.validation.pattern).test(value)) {
      return true;
    }
    
    if (this.validation.custom && !this.validation.custom(value)) {
      return true;
    }
    
    return false;
  }

  get errorMessage(): string {
    const value = this.control.value || '';
    
    if (this.validation.required && !value) {
      return 'This field is required';
    }
    
    if (this.validation.minLength && value.length < this.validation.minLength) {
      return `Minimum length is ${this.validation.minLength} characters`;
    }
    
    if (this.validation.maxLength && value.length > this.validation.maxLength) {
      return `Maximum length is ${this.validation.maxLength} characters`;
    }
    
    if (this.validation.pattern && !new RegExp(this.validation.pattern).test(value)) {
      return 'Invalid format';
    }
    
    if (this.validation.custom && !this.validation.custom(value)) {
      return 'Invalid value';
    }
    
    return '';
  }

  writeValue(value: string): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
    this.control.valueChanges.subscribe(value => fn(value || ''));
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
} 