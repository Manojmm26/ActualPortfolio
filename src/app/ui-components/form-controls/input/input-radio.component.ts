import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface RadioOption {
  label: string;
  value: any;
  description?: string;
  disabled?: boolean;
}

@Component({
  selector: 'ui-radio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-radio" [class.vertical]="layout === 'vertical'">
      <label *ngIf="label" class="radio-group-label" [class.required]="required">
        {{ label }}
      </label>

      <div class="radio-group" role="radiogroup" [attr.aria-label]="label">
        <div *ngFor="let option of options; let i = index"
             class="radio-option"
             [class.disabled]="option.disabled || disabled">
          <div class="radio-input-container">
            <input
              type="radio"
              [id]="id + '-' + i"
              [name]="name"
              [value]="option.value"
              [checked]="value === option.value"
              [disabled]="option.disabled || disabled"
              (change)="onOptionChange(option)"
              (focus)="focused = true"
              (blur)="focused = false; onTouched()"
              [attr.aria-describedby]="option.description ? id + '-desc-' + i : null"
            />
            <div class="radio-control">
              <div class="radio-inner"></div>
            </div>
          </div>

          <label [for]="id + '-' + i" class="radio-label">
            <span class="label-text">{{ option.label }}</span>
            <span *ngIf="option.description"
                  [id]="id + '-desc-' + i"
                  class="description-text">
              {{ option.description }}
            </span>
          </label>
        </div>
      </div>

      <div *ngIf="hint" class="radio-hint">{{ hint }}</div>
      <div *ngIf="error" class="radio-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./input-radio.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRadioComponent),
      multi: true
    }
  ]
})
export class InputRadioComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() name = 'radio-' + Math.random().toString(36).substring(2);
  @Input() options: RadioOption[] = [];
  @Input() layout: 'horizontal' | 'vertical' = 'vertical';
  @Input() required = false;

  @Output() optionChange = new EventEmitter<RadioOption>();

  value: any = null;
  focused = false;
  id = 'ui-radio-' + Math.random().toString(36).substring(2);

  protected onTouched: () => void = () => {};
  private onChange: (value: any) => void = () => {};

  onOptionChange(option: RadioOption): void {
    if (option.disabled || this.disabled) return;

    this.value = option.value;
    this.onChange(this.value);
    this.optionChange.emit(option);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    this.value = value;
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