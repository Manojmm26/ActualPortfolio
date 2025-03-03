import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-toggle',
  template: `
    <div class="inline-flex items-center">
      <label class="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          [id]="inputId"
          [checked]="checked"
          [disabled]="disabled"
          (change)="onInputChange($event)"
          (blur)="onBlur()"
          class="sr-only peer"
        />
        <div
          class="w-11 h-6 rounded-full transition-all duration-200
                 after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                 after:bg-white after:rounded-full after:h-5 after:w-5
                 after:transition-all after:duration-200
                 peer-checked:after:translate-x-full
                 peer-checked:after:border-white
                 peer-disabled:cursor-not-allowed
                 peer-disabled:opacity-50"
          [class]="[
            checked ? colorClasses.checked : colorClasses.unchecked,
            size === 'sm' ? 'scale-75' : size === 'lg' ? 'scale-125' : ''
          ]"
        ></div>
        <span
          *ngIf="label"
          class="ml-3 text-sm font-medium text-gray-700 select-none"
          [class.opacity-50]="disabled"
        >
          {{ label }}
        </span>
      </label>

      <!-- Description -->
      <p
        *ngIf="description"
        class="text-xs text-gray-500 mt-1"
        [class.opacity-50]="disabled"
      >
        {{ description }}
      </p>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true
    }
  ]
})
export class ToggleComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() description = '';
  @Input() override size: 'sm' | 'md' | 'lg' = 'md';
  @Input() override disabled = false;

  inputId = this.generateComponentId();
  checked = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  get colorClasses(): { checked: string; unchecked: string } {
    const colors = {
      primary: {
        checked: 'bg-primary-500 peer-focus:ring-primary-500/25',
        unchecked: 'bg-gray-200 peer-focus:ring-gray-500/25'
      },
      secondary: {
        checked: 'bg-gray-500 peer-focus:ring-gray-500/25',
        unchecked: 'bg-gray-200 peer-focus:ring-gray-500/25'
      },
      success: {
        checked: 'bg-green-500 peer-focus:ring-green-500/25',
        unchecked: 'bg-gray-200 peer-focus:ring-green-500/25'
      },
      danger: {
        checked: 'bg-red-500 peer-focus:ring-red-500/25',
        unchecked: 'bg-gray-200 peer-focus:ring-red-500/25'
      },
      warning: {
        checked: 'bg-yellow-500 peer-focus:ring-yellow-500/25',
        unchecked: 'bg-gray-200 peer-focus:ring-yellow-500/25'
      },
      info: {
        checked: 'bg-blue-500 peer-focus:ring-blue-500/25',
        unchecked: 'bg-gray-200 peer-focus:ring-blue-500/25'
      }
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
} 