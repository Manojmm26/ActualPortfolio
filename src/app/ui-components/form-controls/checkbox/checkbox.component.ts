import { Component, Input, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inline-flex items-center">
      <input
        #input
        type="checkbox"
        [id]="inputId"
        [checked]="checked"
        [disabled]="disabled"
        [indeterminate]="indeterminate"
        [required]="required"
        (change)="onInputChange($event)"
        (blur)="onBlur()"
        class="hidden"
      />
      <label
        [for]="inputId"
        class="inline-flex items-center cursor-pointer select-none"
        [class.cursor-not-allowed]="disabled"
      >
        <span
          class="relative w-5 h-5 border-2 rounded transition-all duration-200
                 flex items-center justify-center mr-2"
          [ngClass]="[
            checked || indeterminate ? colorClasses : 'border-gray-300',
            disabled ? 'opacity-50' : 'hover:border-primary-500'
          ]"
        >
          <!-- Checkmark -->
          <svg
            *ngIf="checked && !indeterminate"
            class="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <!-- Indeterminate mark -->
          <svg
            *ngIf="indeterminate"
            class="w-3.5 h-3.5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 12h14"
            />
          </svg>
        </span>
        <ng-content></ng-content>
      </label>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true
    }
  ]
})
export class CheckboxComponent extends BaseComponent implements ControlValueAccessor {
  @Input() required = false;
  @Input() indeterminate = false;
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  inputId = this.generateComponentId();
  checked = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  get colorClasses(): string {
    const colors = {
      primary: 'border-primary-500 bg-primary-500',
      secondary: 'border-gray-500 bg-gray-500',
      success: 'border-green-500 bg-green-500',
      danger: 'border-red-500 bg-red-500',
      warning: 'border-yellow-500 bg-yellow-500',
      info: 'border-blue-500 bg-blue-500'
    };
    return colors[this.theme as keyof typeof colors || 'primary'];
  }

  writeValue(value: boolean): void {
    this.checked = value;
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

  onInputChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.checked = checkbox.checked;
    this.onChange(this.checked);
  }

  onBlur(): void {
    this.onTouched();
  }

  ngAfterViewInit(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.indeterminate = this.indeterminate;
    }
  }

  ngOnChanges(): void {
    if (this.inputElement) {
      this.inputElement.nativeElement.indeterminate = this.indeterminate;
    }
  }
} 