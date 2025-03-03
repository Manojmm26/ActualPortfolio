import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-input-text" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="!!value">
        <input
          #input
          [type]="type"
          [value]="value"
          [placeholder]="floatingLabel ? ' ' : placeholder"
          [disabled]="disabled"
          [required]="required"
          [attr.maxlength]="maxLength"
          [attr.minlength]="minLength"
          [attr.pattern]="pattern"
          [attr.autocomplete]="autocomplete"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="input-field"
        />
        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>
        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-text.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true
    }
  ]
})
export class InputTextComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() type = 'text';
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() maxLength?: number;
  @Input() minLength?: number;
  @Input() pattern?: string;
  @Input() autocomplete = 'off';

  value = '';
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

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