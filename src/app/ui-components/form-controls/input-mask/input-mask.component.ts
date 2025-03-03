import { Component, Input, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-input-mask',
  templateUrl: './input-mask.component.html',
  styleUrls: ['./input-mask.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMaskComponent),
      multi: true
    }
  ]
})
export class InputMaskComponent extends BaseComponent implements ControlValueAccessor, OnInit {
  @Input() mask = '';  // Example: (999) 999-9999 or 99/99/9999
  @Input() placeholder = '';
  @Input() override disabled = false;
  @Input() maskChar = '_';  // Character to show for empty positions
  @Input() autoComplete = 'off';
  @Input() label = '';
  @Input() showMaskOnHover = true;

  value = '';
  focused = false;
  displayValue = '';
  rawValue = '';
  id = `ui-mask-${Math.random().toString(36).substr(2, 9)}`;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnInit() {
    this.updateDisplayValue();
  }

  private updateDisplayValue() {
    if (!this.mask) {
      this.displayValue = this.value;
      return;
    }

    let maskIndex = 0;
    let valueIndex = 0;
    let result = '';

    while (maskIndex < this.mask.length) {
      const maskChar = this.mask[maskIndex];
      const valueChar = this.value[valueIndex];

      if (this.isSpecialChar(maskChar)) {
        result += maskChar;
        maskIndex++;
      } else {
        if (valueChar && this.isValidChar(valueChar, maskChar)) {
          result += valueChar;
          valueIndex++;
          maskIndex++;
        } else {
          result += this.focused ? this.maskChar : '';
          maskIndex++;
        }
      }
    }

    this.displayValue = result;
  }

  private isSpecialChar(char: string): boolean {
    return !['9', 'a', '*'].includes(char);
  }

  private isValidChar(value: string, maskChar: string): boolean {
    switch (maskChar) {
      case '9': return /\d/.test(value);
      case 'a': return /[a-zA-Z]/.test(value);
      case '*': return true;
      default: return false;
    }
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let newValue = input.value.replace(/[^\w\s]/g, '');
    
    // Apply mask constraints
    let maskedValue = '';
    let valueIndex = 0;
    
    for (let i = 0; i < this.mask.length && valueIndex < newValue.length; i++) {
      const maskChar = this.mask[i];
      
      if (this.isSpecialChar(maskChar)) {
        maskedValue += maskChar;
      } else {
        while (valueIndex < newValue.length) {
          const char = newValue[valueIndex];
          valueIndex++;
          
          if (this.isValidChar(char, maskChar)) {
            maskedValue += char;
            break;
          }
        }
      }
    }

    this.value = maskedValue;
    this.rawValue = this.value.replace(/[^\w\s]/g, '');
    this.updateDisplayValue();
    this.onChange(this.rawValue);
  }

  onFocus() {
    this.focused = true;
    this.updateDisplayValue();
  }

  onBlur() {
    this.focused = false;
    this.updateDisplayValue();
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.updateDisplayValue();
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