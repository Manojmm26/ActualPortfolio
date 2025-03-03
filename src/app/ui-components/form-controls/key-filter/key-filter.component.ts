import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

type PredefinedPattern = 'int' | 'number' | 'money' | 'hex' | 'email' | 'alpha' | 'alphanum' | 'url';

@Component({
  selector: 'ui-key-filter',
  templateUrl: './key-filter.component.html',
  styleUrls: ['./key-filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KeyFilterComponent),
      multi: true
    }
  ]
})
export class KeyFilterComponent extends BaseComponent implements ControlValueAccessor {
  @Input() pattern?: PredefinedPattern | RegExp;
  @Input() placeholder = '';
  @Input() override disabled = false;
  @Input() label = '';
  @Input() validateOnly = false; // If true, only validates but doesn't prevent input
  @Input() showValidationHint = true;
  @Output() invalidInput = new EventEmitter<string>();

  value = '';
  focused = false;
  id = `ui-key-filter-${Math.random().toString(36).substr(2, 9)}`;
  isValid = true;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  private readonly patterns: Record<PredefinedPattern, RegExp> = {
    int: /^\d*$/,
    number: /^[\d.]*$/,
    money: /^[\d.]*$/,
    hex: /^[0-9a-fA-F]*$/,
    email: /^[a-zA-Z0-9.@_-]*$/,
    alpha: /^[a-zA-Z]*$/,
    alphanum: /^[a-zA-Z0-9]*$/,
    url: /^[a-zA-Z0-9-._~:/?#\[\]@!$&'()*+,;=]*$/
  };

  private getValidationPattern(): RegExp {
    if (!this.pattern) {
      return /.*/;
    }
    if (this.pattern instanceof RegExp) {
      return this.pattern;
    }
    return this.patterns[this.pattern];
  }

  onKeyPress(event: KeyboardEvent): boolean {
    if (this.disabled || this.validateOnly) {
      return true;
    }

    const char = event.key;
    if (char.length !== 1) { // Allow special keys
      return true;
    }

    const pattern = this.getValidationPattern();
    const testValue = this.value + char;
    const isValid = pattern.test(testValue);

    if (!isValid) {
      event.preventDefault();
      this.invalidInput.emit(char);
    }

    return isValid;
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const newValue = input.value;
    const pattern = this.getValidationPattern();
    
    this.isValid = pattern.test(newValue);
    
    if (this.validateOnly || this.isValid) {
      this.value = newValue;
      this.onChange(newValue);
    } else {
      // Revert to last valid value if validation fails
      input.value = this.value;
    }

    if (!this.isValid) {
      this.invalidInput.emit(newValue);
    }
  }

  onFocus() {
    this.focused = true;
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  getValidationMessage(): string {
    if (!this.pattern || this.isValid) {
      return '';
    }

    const patternType = this.pattern instanceof RegExp ? 'custom' : this.pattern;
    switch (patternType) {
      case 'int': return 'Please enter only integers';
      case 'number': return 'Please enter only numbers';
      case 'money': return 'Please enter a valid amount';
      case 'hex': return 'Please enter a valid hexadecimal value';
      case 'email': return 'Please enter valid email characters';
      case 'alpha': return 'Please enter only letters';
      case 'alphanum': return 'Please enter only letters and numbers';
      case 'url': return 'Please enter a valid URL';
      default: return 'Invalid input';
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
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