import { Component, Input, Output, EventEmitter, forwardRef, ContentChild, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-icon-field',
  templateUrl: './icon-field.component.html',
  styleUrls: ['./icon-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconFieldComponent),
      multi: true
    }
  ]
})
export class IconFieldComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() override disabled = false;
  @Input() type: 'text' | 'password' | 'email' | 'number' | 'search' = 'text';
  @Input() leadingIcon?: string;  // Icon class or name
  @Input() trailingIcon?: string;
  @Input() iconClickable = false;
  @Input() clearable = false;
  @Input() autoComplete = 'off';
  @Input() required = false;

  @Output() leadingIconClick = new EventEmitter<void>();
  @Output() trailingIconClick = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  // Allow custom icon templates
  @ContentChild('leadingIconTemplate') leadingIconTemplate?: TemplateRef<any>;
  @ContentChild('trailingIconTemplate') trailingIconTemplate?: TemplateRef<any>;

  value = '';
  focused = false;
  id = `ui-icon-field-${Math.random().toString(36).substr(2, 9)}`;

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
  }

  onFocus() {
    this.focused = true;
  }

  onBlur() {
    this.focused = false;
    this.onTouched();
  }

  onLeadingIconClick(event: MouseEvent) {
    if (this.iconClickable && !this.disabled) {
      event.stopPropagation();
      this.leadingIconClick.emit();
    }
  }

  onTrailingIconClick(event: MouseEvent) {
    if (this.disabled) return;
    
    event.stopPropagation();
    if (this.clearable && this.value) {
      this.clearValue();
    } else if (this.iconClickable) {
      this.trailingIconClick.emit();
    }
  }

  clearValue() {
    this.value = '';
    this.onChange(this.value);
    this.clear.emit();
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