import { Component, Input, Output, EventEmitter, forwardRef, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-input-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-input-otp" [class.focused]="focused">
      <label *ngIf="label" class="otp-label" [class.required]="required">
        {{ label }}
      </label>

      <div class="otp-container">
        <input
          *ngFor="let digit of digits; let i = index"
          #digitInput
          type="text"
          [value]="digit"
          [attr.inputmode]="type === 'numeric' ? 'numeric' : 'text'"
          [attr.pattern]="type === 'numeric' ? '[0-9]*' : undefined"
          [maxLength]="1"
          [disabled]="disabled"
          [required]="required"
          [attr.aria-label]="'Digit ' + (i + 1) + ' of ' + length"
          (input)="onDigitInput($event, i)"
          (keydown)="onKeyDown($event, i)"
          (focus)="onDigitFocus(i)"
          (blur)="onDigitBlur()"
          (paste)="onPaste($event)"
          class="otp-input"
        />
      </div>

      <div *ngIf="hint" class="otp-hint">{{ hint }}</div>
      <div *ngIf="error" class="otp-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./input-otp.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputOTPComponent),
      multi: true
    }
  ]
})
export class InputOTPComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() length = 6;
  @Input() type: 'numeric' | 'text' = 'numeric';
  @Input() required = false;
  @Input() autoFocus = true;

  @Output() completed = new EventEmitter<string>();

  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  digits: string[] = [];
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.digits = new Array(this.length).fill('');
  }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Validate input based on type
    if (this.type === 'numeric' && !/^\d*$/.test(value)) {
      input.value = this.digits[index];
      return;
    }

    // Update digit
    this.digits[index] = value.slice(-1);
    this.updateValue();

    // Move to next input if value entered
    if (value && index < this.length - 1) {
      this.focusDigit(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'Backspace':
        if (!this.digits[index] && index > 0) {
          event.preventDefault();
          this.digits[index - 1] = '';
          this.updateValue();
          this.focusDigit(index - 1);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (index > 0) this.focusDigit(index - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (index < this.length - 1) this.focusDigit(index + 1);
        break;
      case 'Delete':
        this.digits[index] = '';
        this.updateValue();
        break;
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    if (!event.clipboardData) return;

    const pastedData = event.clipboardData.getData('text');
    const filteredData = this.type === 'numeric' 
      ? pastedData.replace(/[^\d]/g, '')
      : pastedData;

    const digits = filteredData.split('').slice(0, this.length);
    digits.forEach((digit, index) => {
      this.digits[index] = digit;
      const input = this.digitInputs.get(index);
      if (input) input.nativeElement.value = digit;
    });

    this.updateValue();
    if (digits.length < this.length) {
      this.focusDigit(digits.length);
    }
  }

  onDigitFocus(index: number): void {
    this.focused = true;
  }

  onDigitBlur(): void {
    setTimeout(() => {
      // Check if any input is still focused
      this.focused = this.digitInputs.some(input => 
        document.activeElement === input.nativeElement
      );
      if (!this.focused) this.onTouched();
    }, 100);
  }

  private focusDigit(index: number): void {
    const input = this.digitInputs.get(index);
    if (input) {
      input.nativeElement.focus();
      // Move cursor to end
      const len = input.nativeElement.value.length;
      input.nativeElement.setSelectionRange(len, len);
    }
  }

  private updateValue(): void {
    const value = this.digits.join('');
    this.onChange(value);
    if (value.length === this.length) {
      this.completed.emit(value);
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    const digits = (value || '').split('');
    this.digits = new Array(this.length).fill('');
    digits.forEach((digit, index) => {
      if (index < this.length) this.digits[index] = digit;
    });
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