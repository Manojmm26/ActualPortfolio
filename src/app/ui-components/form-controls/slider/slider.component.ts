import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface SliderMarker {
  value: number;
  label: string;
}

export type SliderValue = number | [number, number];

@Component({
  selector: 'ui-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-slider" [class.focused]="focused">
      <!-- Label -->
      <label *ngIf="label" class="slider-label" [class.required]="required">
        {{ label }}
      </label>

      <!-- Slider Container -->
      <div class="slider-container"
           [class.disabled]="disabled"
           [class.vertical]="orientation === 'vertical'"
           role="slider"
           [attr.aria-label]="label || 'Slider'"
           [attr.aria-valuemin]="min"
           [attr.aria-valuemax]="max"
           [attr.aria-valuenow]="value"
           [attr.aria-valuetext]="getAriaValueText()"
           [attr.aria-disabled]="disabled"
           [attr.aria-required]="required"
           [tabindex]="disabled ? -1 : 0"
           (keydown)="onKeyDown($event)"
           (focus)="onFocus()"
           (blur)="onBlur()">
        
        <!-- Track -->
        <div #sliderTrack
             class="slider-track"
             (mousedown)="onTrackClick($event)">
          <!-- Track Fill -->
          <div class="track-fill"
               [style.width]="orientation === 'horizontal' ? getTrackFillWidth() : undefined"
               [style.height]="orientation === 'vertical' ? getTrackFillHeight() : undefined">
          </div>

          <!-- Markers -->
          <ng-container *ngIf="markers.length > 0">
            <div *ngFor="let marker of markers"
                 class="marker"
                 [style.left]="orientation === 'horizontal' ? getMarkerPosition(marker.value) : undefined"
                 [style.bottom]="orientation === 'vertical' ? getMarkerPosition(marker.value) : undefined"
                 [attr.data-label]="marker.label">
            </div>
          </ng-container>

          <!-- Handle -->
          <div #sliderHandle
               class="slider-handle"
               [style.left]="orientation === 'horizontal' ? getHandlePosition() : undefined"
               [style.bottom]="orientation === 'vertical' ? getHandlePosition() : undefined"
               (mousedown)="onHandleMouseDown($event)">
          </div>
        </div>

        <!-- Value Display -->
        <div *ngIf="showValue" class="slider-value">
          {{ value }}
        </div>
      </div>

      <!-- Hint & Error -->
      <div *ngIf="hint" class="slider-hint">{{ hint }}</div>
      <div *ngIf="error" class="slider-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./slider.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ]
})
export class SliderComponent extends BaseComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() showValue = false;
  @Input() markers: SliderMarker[] = [];
  @Input() mode: 'single' | 'range' = 'single';
  @Input() showTicks = false;
  @Input() showLabels = false;

  @Output() valueChange = new EventEmitter<SliderValue>();
  @Output() dragStart = new EventEmitter<SliderValue>();
  @Output() dragEnd = new EventEmitter<SliderValue>();

  @ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLDivElement>;
  @ViewChild('sliderHandle') sliderHandle!: ElementRef<HTMLDivElement>;

  value: SliderValue = 0;
  focused = false;
  dragging = false;

  private onChange: (value: SliderValue) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.setupDragListeners();
  }

  private setupDragListeners(): void {
    const moveHandler = (event: MouseEvent) => {
      if (this.dragging) {
        event.preventDefault();
        this.updateValueFromEvent(event);
      }
    };

    const upHandler = () => {
      if (this.dragging) {
        this.dragging = false;
        this.dragEnd.emit(this.value);
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      }
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }

  onTrackClick(event: MouseEvent): void {
    if (this.disabled) return;
    this.updateValueFromEvent(event);
  }

  onHandleMouseDown(event: MouseEvent): void {
    if (this.disabled) return;
    event.preventDefault();
    this.dragging = true;
    this.dragStart.emit(this.value);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    const step = event.shiftKey ? this.step * 10 : this.step;
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        this.adjustValue(-step);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        this.adjustValue(step);
        break;
      case 'Home':
        event.preventDefault();
        this.updateValue(this.min);
        break;
      case 'End':
        event.preventDefault();
        this.updateValue(this.max);
        break;
      case 'PageDown':
        event.preventDefault();
        this.adjustValue(-step * 10);
        break;
      case 'PageUp':
        event.preventDefault();
        this.adjustValue(step * 10);
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

  private updateValueFromEvent(event: MouseEvent): void {
    const rect = this.sliderTrack.nativeElement.getBoundingClientRect();
    let percentage: number;

    if (this.orientation === 'horizontal') {
      percentage = (event.clientX - rect.left) / rect.width;
    } else {
      percentage = (rect.bottom - event.clientY) / rect.height;
    }

    percentage = Math.max(0, Math.min(1, percentage));
    const rawValue = this.min + (this.max - this.min) * percentage;
    this.updateValue(this.snapToStep(rawValue));
  }

  private snapToStep(value: number): number {
    const numSteps = Math.round((value - this.min) / this.step);
    return this.min + numSteps * this.step;
  }

  private updateValue(newValue: SliderValue): void {
    if (this.disabled) return;
    
    if (Array.isArray(newValue)) {
      // Handle range mode
      const [start, end] = newValue;
      this.value = [
        Math.max(this.min, Math.min(this.max, start)),
        Math.max(this.min, Math.min(this.max, end))
      ];
    } else {
      // Handle single mode
      this.value = Math.max(this.min, Math.min(this.max, newValue));
    }
    
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  private adjustValue(adjustment: number): void {
    if (Array.isArray(this.value)) {
      // Handle range mode
      const [start, end] = this.value;
      this.updateValue([start + adjustment, end + adjustment]);
    } else {
      // Handle single mode
      this.updateValue(this.value + adjustment);
    }
  }

  getHandlePosition(): string {
    if (Array.isArray(this.value)) {
      // For range mode, return position of the active handle
      const activeValue = this.value[0]; // or this.value[1] depending on which handle is active
      const percentage = ((activeValue - this.min) / (this.max - this.min)) * 100;
      return `${percentage}%`;
    } else {
      // For single mode
      const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
      return `${percentage}%`;
    }
  }

  getTrackFillWidth(): string {
    return this.getHandlePosition();
  }

  getTrackFillHeight(): string {
    return this.getHandlePosition();
  }

  getMarkerPosition(value: number): string {
    const percentage = ((value - this.min) / (this.max - this.min)) * 100;
    return `${percentage}%`;
  }

  getAriaValueText(): string {
    return Array.isArray(this.value) ? `${this.value[0]} - ${this.value[1]}` : `${this.value}`;
  }

  // ControlValueAccessor Implementation
  writeValue(value: SliderValue): void {
    this.value = value || this.min;
  }

  registerOnChange(fn: (value: SliderValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
} 