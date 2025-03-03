import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface RatingValidation {
  required?: boolean;
  min?: number;
  max?: number;
}

@Component({
  selector: 'ui-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-rating" [class.focused]="focused">
      <!-- Label -->
      <label *ngIf="label" class="rating-label" [class.required]="required">
        {{ label }}
      </label>

      <!-- Rating Stars -->
      <div class="rating-container"
           role="slider"
           [attr.aria-label]="label || 'Rating'"
           [attr.aria-valuemin]="0"
           [attr.aria-valuemax]="max"
           [attr.aria-valuenow]="value"
           [attr.aria-valuetext]="getAriaValueText()"
           [attr.aria-disabled]="disabled"
           [attr.aria-required]="required"
           [tabindex]="disabled ? -1 : 0"
           (keydown)="onKeyDown($event)"
           (focus)="onFocus()"
           (blur)="onBlur()">
        <div class="stars-container">
          <ng-container *ngFor="let star of stars; let i = index">
            <div class="star-wrapper"
                 [class.disabled]="disabled"
                 (mouseenter)="!disabled && onStarHover(i + 1)"
                 (mouseleave)="!disabled && onStarLeave()"
                 (click)="!disabled && onStarClick(i + 1)">
              <!-- Empty Star -->
              <i [class]="emptyIcon" class="star empty"></i>
              
              <!-- Filled Star (full or half) -->
              <i *ngIf="isFilled(i + 1)"
                 [class]="filledIcon"
                 class="star filled"
                 [style.clip-path]="isHalf(i + 1) ? 'inset(0 50% 0 0)' : ''">
              </i>
            </div>
          </ng-container>
        </div>

        <!-- Value Display -->
        <div *ngIf="showValue" class="rating-value">
          {{ value || 0 }}/{{ max }}
        </div>
      </div>

      <!-- Hint & Error -->
      <div *ngIf="hint" class="rating-hint">{{ hint }}</div>
      <div *ngIf="error" class="rating-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true
    }
  ]
})
export class RatingComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() max = 5;
  @Input() allowHalf = false;
  @Input() showValue = false;
  @Input() emptyIcon = 'fas fa-star';
  @Input() filledIcon = 'fas fa-star';
  @Input() validation?: RatingValidation;

  @Output() ratingChange = new EventEmitter<number>();

  value = 0;
  focused = false;
  hoverValue: number | null = null;
  stars: number[] = [];

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.stars = Array(this.max).fill(0).map((_, i) => i + 1);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.updateValue(Math.max(0, (this.value || 0) - (this.allowHalf ? 0.5 : 1)));
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.updateValue(Math.min(this.max, (this.value || 0) + (this.allowHalf ? 0.5 : 1)));
        break;
      case 'Home':
        event.preventDefault();
        this.updateValue(0);
        break;
      case 'End':
        event.preventDefault();
        this.updateValue(this.max);
        break;
    }
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  onStarHover(value: number): void {
    this.hoverValue = value;
  }

  onStarLeave(): void {
    this.hoverValue = null;
  }

  onStarClick(value: number): void {
    if (this.allowHalf) {
      const rect = (event?.target as HTMLElement).getBoundingClientRect();
      const isLeftHalf = (event as MouseEvent).clientX - rect.left < rect.width / 2;
      value = isLeftHalf ? value - 0.5 : value;
    }
    this.updateValue(this.value === value ? 0 : value);
  }

  isFilled(index: number): boolean {
    const currentValue = this.hoverValue ?? this.value;
    return currentValue >= index;
  }

  isHalf(index: number): boolean {
    if (!this.allowHalf) return false;
    const currentValue = this.hoverValue ?? this.value;
    return currentValue + 0.5 === index;
  }

  getAriaValueText(): string {
    return `${this.value || 0} out of ${this.max} stars`;
  }

  private updateValue(value: number): void {
    if (this.disabled) return;
    
    this.value = value;
    this.onChange(value);
    this.ratingChange.emit(value);
  }

  // ControlValueAccessor Implementation
  writeValue(value: number): void {
    this.value = value || 0;
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