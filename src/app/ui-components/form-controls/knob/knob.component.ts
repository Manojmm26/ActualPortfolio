import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-knob',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ui-knob" [class.focused]="focused">
      <label *ngIf="label" class="knob-label" [class.required]="required">
        {{ label }}
      </label>

      <div class="knob-container"
           [class.disabled]="disabled"
           [style.width.px]="knobSize"
           [style.height.px]="knobSize"
           role="slider"
           [attr.aria-label]="label"
           [attr.aria-valuemin]="min"
           [attr.aria-valuemax]="max"
           [attr.aria-valuenow]="value"
           [attr.aria-valuetext]="getAriaValueText()"
           [attr.aria-disabled]="disabled"
           tabindex="0"
           (keydown)="onKeyDown($event)"
           (focus)="onFocus()"
           (blur)="onBlur()">
        
        <!-- Background Circle -->
        <svg class="knob-svg" #knobSvg
             [attr.width]="knobSize"
             [attr.height]="knobSize"
             (mousedown)="onMouseDown($event)"
             (touchstart)="onTouchStart($event)">
          <circle class="knob-track"
                  [attr.cx]="center"
                  [attr.cy]="center"
                  [attr.r]="radius"
                  [attr.stroke-width]="strokeWidth"/>
          
          <circle class="knob-progress"
                  [attr.cx]="center"
                  [attr.cy]="center"
                  [attr.r]="radius"
                  [attr.stroke-width]="strokeWidth"
                  [attr.stroke-dasharray]="circumference"
                  [attr.stroke-dashoffset]="getDashOffset()"/>
          
          <!-- Value Marker -->
          <circle class="knob-marker"
                  [attr.cx]="getMarkerX()"
                  [attr.cy]="getMarkerY()"
                  [attr.r]="markerRadius"/>
        </svg>

        <!-- Value Display -->
        <div class="knob-value" *ngIf="showValue">
          {{ valueFormat ? valueFormat(value) : value + (valueUnit || '') }}
        </div>
      </div>

      <!-- Hint/Error Messages -->
      <div *ngIf="hint" class="knob-hint">{{ hint }}</div>
      <div *ngIf="error" class="knob-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./knob.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KnobComponent),
      multi: true
    }
  ]
})
export class KnobComponent extends BaseComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() min = 0;
  @Input() max = 100;
  @Input() step = 1;
  @Input() knobSize = 200;
  @Input() strokeWidth = 10;
  @Input() showValue = true;
  @Input() valueUnit = '';
  @Input() valueFormat?: (value: number) => string;
  @Input() startAngle = -135;
  @Input() endAngle = 135;
  @Input() override disabled = false;

  @Output() change = new EventEmitter<number>();

  @ViewChild('knobSvg') knobSvg!: ElementRef<SVGElement>;

  value = 0;
  focused = false;
  dragging = false;
  rotation = 0;

  get center(): number {
    return this.knobSize / 2;
  }

  get radius(): number {
    return (this.knobSize - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get markerRadius(): number {
    return this.strokeWidth * 0.8;
  }

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.updateRotation();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const moveHandler = (event: MouseEvent | TouchEvent) => {
      if (!this.dragging) return;
      event.preventDefault();
      this.updateValueFromEvent(event);
    };

    const upHandler = () => {
      if (!this.dragging) return;
      this.dragging = false;
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.removeEventListener('touchmove', moveHandler);
      document.removeEventListener('touchend', upHandler);
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.addEventListener('touchmove', moveHandler);
    document.addEventListener('touchend', upHandler);
  }

  onMouseDown(event: MouseEvent): void {
    if (this.disabled) return;
    this.dragging = true;
    this.updateValueFromEvent(event);
  }

  onTouchStart(event: TouchEvent): void {
    if (this.disabled) return;
    this.dragging = true;
    this.updateValueFromEvent(event);
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.disabled) return;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault();
        this.increment();
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault();
        this.decrement();
        break;
      case 'Home':
        event.preventDefault();
        this.setValue(this.min);
        break;
      case 'End':
        event.preventDefault();
        this.setValue(this.max);
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

  private updateValueFromEvent(event: MouseEvent | TouchEvent): void {
    const rect = this.knobSvg.nativeElement.getBoundingClientRect();
    const centerX = rect.left + this.center;
    const centerY = rect.top + this.center;

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
    const normalizedAngle = (angle - this.startAngle + 360) % 360;
    const angleRange = this.endAngle - this.startAngle;
    const percentage = (normalizedAngle / angleRange) * 100;

    const newValue = this.min + ((this.max - this.min) * percentage) / 100;
    this.setValue(this.snapToStep(newValue));
  }

  private snapToStep(value: number): number {
    const snapped = Math.round(value / this.step) * this.step;
    return Math.min(Math.max(snapped, this.min), this.max);
  }

  private increment(): void {
    this.setValue(Math.min(this.value + this.step, this.max));
  }

  private decrement(): void {
    this.setValue(Math.max(this.value - this.step, this.min));
  }

  private setValue(value: number): void {
    if (this.value === value) return;
    this.value = value;
    this.onChange(value);
    this.change.emit(value);
  }

  getDashOffset(): number {
    const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
    return this.circumference - (this.circumference * percentage) / 100;
  }

  getMarkerX(): number {
    const angle = this.startAngle + ((this.value - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle);
    return this.center + this.radius * Math.cos(angle * (Math.PI / 180));
  }

  getMarkerY(): number {
    const angle = this.startAngle + ((this.value - this.min) / (this.max - this.min)) * (this.endAngle - this.startAngle);
    return this.center + this.radius * Math.sin(angle * (Math.PI / 180));
  }

  getAriaValueText(): string {
    if (this.valueFormat) {
      return this.valueFormat(this.value);
    }
    return this.value + (this.valueUnit || '');
  }

  // ControlValueAccessor Implementation
  writeValue(value: number): void {
    this.value = value || this.min;
    this.updateRotation();
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  private updateRotation(): void {
    const range = this.max - this.min;
    this.rotation = ((this.value - this.min) / range) * 360;
  }
} 