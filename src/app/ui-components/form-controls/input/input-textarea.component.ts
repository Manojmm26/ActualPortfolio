import { Component, Input, forwardRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-textarea" [class.floating]="floatingLabel">
      <div class="textarea-container" [class.focused]="focused" [class.filled]="!!value">
        <textarea
          #textarea
          [value]="value"
          [placeholder]="floatingLabel ? ' ' : placeholder"
          [disabled]="disabled"
          [required]="required"
          [attr.maxlength]="maxLength"
          [attr.minlength]="minLength"
          [attr.rows]="rows"
          [attr.autocomplete]="autocomplete"
          (input)="onInput($event)"
          (focus)="onFocus()"
          (blur)="onBlur()"
          class="textarea-field"
          [class.auto-resize]="autoResize"
        ></textarea>

        <label *ngIf="label" class="textarea-label" [class.required]="required">
          {{ label }}
        </label>

        <div *ngIf="hint || (showCharCount && maxLength)" class="textarea-footer">
          <div *ngIf="hint" class="textarea-hint">{{ hint }}</div>
          <div *ngIf="showCharCount && maxLength" class="character-count">
            {{ value.length || 0 }}/{{ maxLength }}
          </div>
        </div>

        <div *ngIf="error" class="textarea-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-textarea.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextAreaComponent),
      multi: true
    }
  ]
})
export class TextAreaComponent extends BaseComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() rows = 3;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() autoResize = true;
  @Input() showCharCount = true;
  @Input() autocomplete = 'off';

  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;

  value = '';
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit() {
    if (this.autoResize) {
      this.adjustTextareaHeight();
    }
  }

  onInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.value = textarea.value;
    this.onChange(this.value);

    if (this.autoResize) {
      this.adjustTextareaHeight();
    }
  }

  onFocus(): void {
    this.focused = true;
    this.onTouched();
  }

  onBlur(): void {
    this.focused = false;
  }

  private adjustTextareaHeight(): void {
    const textarea = this.textareaRef.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
    
    // Need to wait for next tick to adjust height after value is rendered
    if (this.autoResize) {
      setTimeout(() => this.adjustTextareaHeight());
    }
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