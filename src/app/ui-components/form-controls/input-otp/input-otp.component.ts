import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputOTPComponent),
      multi: true
    }
  ],
  template: `
    <div class="otp-input-container">
      <input
        type="text"
        maxlength="1"
        *ngFor="let digit of digits; let i = index"
        [(ngModel)]="digits[i]"
        (input)="onInput(i)"
        (keydown)="onKeyDown($event, i)"
        [class.filled]="digits[i]"
      />
    </div>
  `,
  styles: [`
    .otp-input-container {
      display: flex;
      gap: 8px;
    }
    input {
      width: 40px;
      height: 40px;
      text-align: center;
      font-size: 18px;
      border: 1px solid var(--color-border);
      border-radius: var(--border-radius);
      outline: none;
    }
    input:focus {
      border-color: var(--color-primary);
    }
    input.filled {
      background-color: var(--color-surface-variant);
    }
  `]
})
export class InputOTPComponent implements ControlValueAccessor {
  @Input() length = 6;
  digits: string[] = Array(this.length).fill('');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    if (value) {
      this.digits = value.split('').slice(0, this.length);
      while (this.digits.length < this.length) {
        this.digits.push('');
      }
    } else {
      this.digits = Array(this.length).fill('');
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onInput(index: number): void {
    if (index < this.length - 1 && this.digits[index]) {
      const nextInput = document.querySelector(`input:nth-child(${index + 2})`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    this.emitValue();
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      const prevInput = document.querySelector(`input:nth-child(${index})`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  }

  private emitValue(): void {
    const value = this.digits.join('');
    this.onChange(value);
    this.onTouched();
  }
} 