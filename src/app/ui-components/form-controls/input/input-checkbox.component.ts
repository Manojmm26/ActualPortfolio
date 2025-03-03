import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-checkbox">
      <div class="checkbox-container" [class.disabled]="disabled">
        <div class="checkbox-input-container">
          <input
            type="checkbox"
            [id]="id"
            [checked]="value"
            [disabled]="disabled"
            [required]="required"
            [indeterminate]="indeterminate"
            (change)="onCheckboxChange($event)"
            (focus)="focused = true"
            (blur)="focused = false; onTouched()"
            [attr.aria-describedby]="description ? id + '-desc' : null"
          />
          <div class="checkbox-control">
            <!-- Checkmark icon -->
            <svg *ngIf="!indeterminate" class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
            </svg>
            <!-- Indeterminate icon -->
            <svg *ngIf="indeterminate" class="indeterminate" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
        </div>

        <label [for]="id" class="checkbox-label" [class.required]="required">
          <span class="label-text">{{ label }}</span>
          <span *ngIf="description"
                [id]="id + '-desc'"
                class="description-text">
            {{ description }}
          </span>
        </label>
      </div>

      <div *ngIf="hint" class="checkbox-hint">{{ hint }}</div>
      <div *ngIf="error" class="checkbox-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./input-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCheckboxComponent),
      multi: true
    }
  ]
})
export class InputCheckboxComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() indeterminate = false;

  @Output() change = new EventEmitter<boolean>();

  value = false;
  focused = false;
  id = 'ui-checkbox-' + Math.random().toString(36).substring(2);

  protected onTouched: () => void = () => {};
  private onChange: (value: boolean) => void = () => {};

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.value = checkbox.checked;
    this.indeterminate = false;
    this.onChange(this.value);
    this.change.emit(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
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