import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

type MaskToken = '9' | 'a' | '*';

@Component({
  selector: 'ui-input-mask',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-input-mask" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="!!value">
        <div class="input-wrapper">
          <input
            #input
            type="text"
            [value]="displayValue"
            [placeholder]="floatingLabel ? ' ' : placeholder"
            [disabled]="disabled"
            [required]="required"
            [attr.maxlength]="getMaskLength()"
            [attr.autocomplete]="autocomplete"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown)="onKeyDown($event)"
            class="input-field"
          />
          
          <div *ngIf="showMask && focused" class="mask-hint">
            {{ mask }}
          </div>
        </div>
        
        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>
        
        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-mask.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputMaskComponent),
      multi: true
    }
  ]
})
export class InputMaskComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() mask = '';  // Example: (999) 999-9999 or 99/99/9999
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() showMask = true;
  @Input() autocomplete = 'off';
  @Input() maskChar = '_';  // Character to show for empty positions

  value = '';
  displayValue = '';
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newValue = this.processInput(input.value);
    this.updateValue(newValue);
  }

  onKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;

    // Allow special keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
        ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      return;
    }

    // Prevent input if max length reached
    if (input.value.length >= this.getMaskLength() && 
        input.selectionStart === input.selectionEnd) {
      event.preventDefault();
      return;
    }

    // Check if the key matches the mask pattern at current position
    const position = input.selectionStart || 0;
    if (!this.isValidChar(key, this.getMaskTokenAtPosition(position))) {
      event.preventDefault();
    }
  }

  onFocus(): void {
    this.focused = true;
    this.onTouched();
  }

  onBlur(): void {
    this.focused = false;
    // Clean up incomplete value
    if (this.value.includes(this.maskChar)) {
      this.updateValue('');
    }
  }

  private processInput(input: string): string {
    let result = '';
    let valueIndex = 0;
    
    for (let i = 0; i < this.mask.length && valueIndex < input.length; i++) {
      const maskChar = this.mask[i];
      const inputChar = input[valueIndex];

      if (this.isSpecialChar(maskChar)) {
        result += maskChar;
      } else {
        if (this.isValidChar(inputChar, maskChar as MaskToken)) {
          result += inputChar;
          valueIndex++;
        } else {
          valueIndex++;
          i--;
        }
      }
    }

    return result;
  }

  private updateValue(newValue: string): void {
    this.value = newValue;
    this.displayValue = this.formatDisplayValue();
    this.onChange(this.value);
  }

  private formatDisplayValue(): string {
    let result = '';
    let valueIndex = 0;

    for (let i = 0; i < this.mask.length; i++) {
      const maskChar = this.mask[i];
      
      if (this.isSpecialChar(maskChar)) {
        result += maskChar;
      } else {
        result += valueIndex < this.value.length ? 
          this.value[valueIndex] : this.maskChar;
        valueIndex++;
      }
    }

    return result;
  }

  private isSpecialChar(char: string): boolean {
    return !['9', 'a', '*'].includes(char);
  }

  private isValidChar(char: string, maskToken: MaskToken): boolean {
    switch (maskToken) {
      case '9': return /\d/.test(char);
      case 'a': return /[a-zA-Z]/.test(char);
      case '*': return true;
      default: return false;
    }
  }

  private getMaskTokenAtPosition(position: number): MaskToken {
    return '*';
  }

  protected getMaskLength(): number {
    return this.mask.length;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    this.displayValue = this.formatDisplayValue();
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