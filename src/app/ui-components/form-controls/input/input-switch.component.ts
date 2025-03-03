import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-switch',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-switch">
      <div class="switch-container" 
           [class.disabled]="disabled"
           [class.focused]="focused">
        <div class="switch-input-container">
          <input
            type="checkbox"
            [id]="id"
            [checked]="value"
            [disabled]="disabled"
            [required]="required"
            (change)="onSwitchChange($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            [attr.aria-describedby]="getAriaDescribedBy()"
            role="switch"
            [attr.aria-checked]="value"
          />
          <div class="switch-control">
            <div class="switch-thumb"></div>
          </div>
        </div>

        <label *ngIf="label" [for]="id" class="switch-label" [class.required]="required">
          <span class="label-text">{{ label }}</span>
          <span *ngIf="description"
                [id]="id + '-desc'"
                class="description-text">
            {{ description }}
          </span>
          <span *ngIf="showStates" class="switch-states">
            <span class="on-state" [class.active]="value">{{ onLabel }}</span>
            <span class="off-state" [class.active]="!value">{{ offLabel }}</span>
          </span>
        </label>
      </div>

      <div *ngIf="hint && !error" class="switch-hint" [id]="id + '-hint'">{{ hint }}</div>
      <div *ngIf="error" class="switch-error" [id]="id + '-error'">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./input-switch.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSwitchComponent),
      multi: true
    }
  ]
})
export class InputSwitchComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() showStates = false;
  @Input() onLabel = 'On';
  @Input() offLabel = 'Off';
  @Input() override theme: 'primary' | 'secondary' | 'success' | 'error' = 'primary';
  @Input() override size: 'sm' | 'md' | 'lg' = 'md';

  @Output() change = new EventEmitter<boolean>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  value = false;
  focused = false;
  id = 'ui-switch-' + Math.random().toString(36).substring(2);

  protected onTouched: () => void = () => {};
  private onChange: (value: boolean) => void = () => {};

  onSwitchChange(event: Event): void {
    if (this.disabled) return;
    
    const checkbox = event.target as HTMLInputElement;
    this.value = checkbox.checked;
    this.onChange(this.value);
    this.change.emit(this.value);
  }

  onFocus(): void {
    if (this.disabled) return;
    
    this.focused = true;
    this.focus.emit();
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
    this.blur.emit();
  }

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.description) ids.push(this.id + '-desc');
    if (this.hint) ids.push(this.id + '-hint');
    if (this.error) ids.push(this.id + '-error');
    return ids.length ? ids.join(' ') : null;
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