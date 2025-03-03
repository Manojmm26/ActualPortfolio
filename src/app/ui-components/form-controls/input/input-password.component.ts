import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface PasswordStrength {
  score: number;  // 0-4 (very weak to very strong)
  feedback: string;
  color: string;
}

@Component({
  selector: 'ui-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-password" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="!!value">
        <div class="input-wrapper">
          <input
            #input
            [type]="showPassword ? 'text' : 'password'"
            [value]="value"
            [placeholder]="floatingLabel ? ' ' : placeholder"
            [disabled]="disabled"
            [required]="required"
            [attr.minlength]="minLength"
            [attr.maxlength]="maxLength"
            [attr.pattern]="pattern"
            [attr.autocomplete]="autocomplete"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            class="input-field"
          />

          <button
            *ngIf="showToggle"
            type="button"
            class="toggle-password"
            (click)="togglePasswordVisibility()"
            [attr.aria-label]="showPassword ? 'Hide password' : 'Show password'">
            <span class="icon" aria-hidden="true">
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </span>
          </button>
        </div>

        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>

        <!-- Password Strength Indicator -->
        <div *ngIf="showStrength && value" class="strength-indicator">
          <div class="strength-bar">
            <div class="strength-fill"
                 [style.width.%]="(passwordStrength.score * 25)"
                 [style.background-color]="passwordStrength.color">
            </div>
          </div>
          <div class="strength-text" [style.color]="passwordStrength.color">
            {{ passwordStrength.feedback }}
          </div>
        </div>

        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>

        <!-- Password Requirements -->
        <div *ngIf="showRequirements && focused" class="password-requirements">
          <div class="requirement" [class.met]="hasMinLength">
            {{ minLength }} characters minimum
          </div>
          <div class="requirement" [class.met]="hasUpperCase">
            One uppercase letter
          </div>
          <div class="requirement" [class.met]="hasLowerCase">
            One lowercase letter
          </div>
          <div class="requirement" [class.met]="hasNumber">
            One number
          </div>
          <div class="requirement" [class.met]="hasSpecialChar">
            One special character
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./input-password.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPasswordComponent),
      multi: true
    }
  ]
})
export class InputPasswordComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() minLength = 8;
  @Input() maxLength?: number;
  @Input() pattern?: string;
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() showToggle = true;
  @Input() showStrength = true;
  @Input() showRequirements = true;
  @Input() autocomplete = 'new-password';

  value = '';
  focused = false;
  showPassword = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  get passwordStrength(): PasswordStrength {
    const score = this.calculatePasswordStrength();
    return {
      score,
      feedback: this.getStrengthFeedback(score),
      color: this.getStrengthColor(score)
    };
  }

  get hasMinLength(): boolean {
    return this.value.length >= this.minLength;
  }

  get hasUpperCase(): boolean {
    return /[A-Z]/.test(this.value);
  }

  get hasLowerCase(): boolean {
    return /[a-z]/.test(this.value);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.value);
  }

  get hasSpecialChar(): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(this.value);
  }

  private calculatePasswordStrength(): number {
    let score = 0;
    if (this.hasMinLength) score++;
    if (this.hasUpperCase) score++;
    if (this.hasLowerCase) score++;
    if (this.hasNumber) score++;
    if (this.hasSpecialChar) score++;
    return Math.min(score, 4);
  }

  private getStrengthFeedback(score: number): string {
    switch (score) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  }

  private getStrengthColor(score: number): string {
    switch (score) {
      case 0: return '#ff4444';
      case 1: return '#ffbb33';
      case 2: return '#ffbb33';
      case 3: return '#00C851';
      case 4: return '#007E33';
      default: return '#gray';
    }
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onFocus(): void {
    this.focused = true;
    this.onTouched();
  }

  onBlur(): void {
    this.focused = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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