import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface ColorPickerValidation {
  required?: boolean;
  custom?: (value: string) => boolean;
}

export interface ColorFormat {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

@Component({
  selector: 'ui-colorpicker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-colorpicker-wrapper" [class.floating]="floatingLabel">
      <div class="ui-colorpicker-input-group">
        <input
          #inputElement
          type="text"
          [id]="inputId"
          [value]="value"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [attr.aria-label]="label"
          [attr.aria-invalid]="!isValid"
          (focus)="onFocus()"
          (input)="onInput($event)"
          (blur)="onBlur()"
          class="ui-colorpicker-input"
          [class.invalid]="!isValid && touched"
        />
        <div 
          class="ui-colorpicker-swatch"
          [style.background-color]="value"
          (click)="togglePicker()"
        ></div>
      </div>

      <label 
        [for]="inputId"
        class="ui-colorpicker-label"
        [class.has-value]="!!value"
      >{{ label }}</label>

      <div class="ui-colorpicker-error" *ngIf="!isValid && touched">
        {{ errorMessage }}
      </div>

      <div class="ui-colorpicker-popup" *ngIf="isOpen">
        <div class="ui-colorpicker-tabs">
          <button
            *ngFor="let tab of tabs"
            class="ui-colorpicker-tab"
            [class.active]="activeTab === tab"
            (click)="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <!-- Color Palette -->
        <div class="ui-colorpicker-palette" *ngIf="activeTab === 'Palette'">
          <div 
            class="ui-colorpicker-saturation"
            #saturation
            (mousedown)="onSaturationMouseDown($event)"
          >
            <div 
              class="ui-colorpicker-saturation-pointer"
              [style.left.%]="saturationPosition.x"
              [style.top.%]="saturationPosition.y"
            ></div>
          </div>
          
          <div 
            class="ui-colorpicker-hue"
            #hue
            (mousedown)="onHueMouseDown($event)"
          >
            <div 
              class="ui-colorpicker-hue-pointer"
              [style.left.%]="(huePosition * 100)"
            ></div>
          </div>

          <div class="ui-colorpicker-alpha" *ngIf="showAlpha">
            <div 
              class="ui-colorpicker-alpha-gradient"
              [style.background-image]="getAlphaGradient()"
            ></div>
            <div 
              class="ui-colorpicker-alpha-pointer"
              [style.left.%]="(alphaPosition * 100)"
            ></div>
          </div>
        </div>

        <!-- RGB Controls -->
        <div class="ui-colorpicker-rgb" *ngIf="activeTab === 'RGB'">
          <div class="ui-colorpicker-channel">
            <label>R</label>
            <input 
              type="number" 
              min="0" 
              max="255" 
              [(ngModel)]="rgb.r"
              (ngModelChange)="updateFromRgb()"
            />
          </div>
          <div class="ui-colorpicker-channel">
            <label>G</label>
            <input 
              type="number" 
              min="0" 
              max="255" 
              [(ngModel)]="rgb.g"
              (ngModelChange)="updateFromRgb()"
            />
          </div>
          <div class="ui-colorpicker-channel">
            <label>B</label>
            <input 
              type="number" 
              min="0" 
              max="255" 
              [(ngModel)]="rgb.b"
              (ngModelChange)="updateFromRgb()"
            />
          </div>
        </div>

        <!-- HSL Controls -->
        <div class="ui-colorpicker-hsl" *ngIf="activeTab === 'HSL'">
          <div class="ui-colorpicker-channel">
            <label>H</label>
            <input 
              type="number" 
              min="0" 
              max="360" 
              [(ngModel)]="hsl.h"
              (ngModelChange)="updateFromHsl()"
            />
          </div>
          <div class="ui-colorpicker-channel">
            <label>S</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              [(ngModel)]="hsl.s"
              (ngModelChange)="updateFromHsl()"
            />
          </div>
          <div class="ui-colorpicker-channel">
            <label>L</label>
            <input 
              type="number" 
              min="0" 
              max="100" 
              [(ngModel)]="hsl.l"
              (ngModelChange)="updateFromHsl()"
            />
          </div>
        </div>

        <!-- HEX Input -->
        <div class="ui-colorpicker-hex" *ngIf="activeTab === 'HEX'">
          <div class="ui-colorpicker-channel">
            <label>#</label>
            <input 
              type="text" 
              maxlength="6"
              [(ngModel)]="hex"
              (ngModelChange)="updateFromHex()"
            />
          </div>
        </div>

        <div class="ui-colorpicker-preview">
          <div class="ui-colorpicker-current" [style.background-color]="value"></div>
          <div class="ui-colorpicker-previous" [style.background-color]="previousColor"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ui-colorpicker-wrapper {
      position: relative;
      width: 100%;
    }

    .ui-colorpicker-input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .ui-colorpicker-input {
      width: 100%;
      padding: 0.75rem;
      padding-right: 3rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 1rem;
      line-height: 1.5;
      background-color: white;
    }

    .ui-colorpicker-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .ui-colorpicker-input.invalid {
      border-color: #ef4444;
    }

    .ui-colorpicker-swatch {
      position: absolute;
      right: 0.5rem;
      width: 2rem;
      height: 2rem;
      border-radius: 0.25rem;
      border: 1px solid #e2e8f0;
      cursor: pointer;
    }

    .ui-colorpicker-label {
      position: absolute;
      left: 0.75rem;
      top: 0.75rem;
      color: #64748b;
      transition: all 0.2s;
      pointer-events: none;
    }

    .floating .ui-colorpicker-input {
      padding-top: 1.25rem;
    }

    .floating .ui-colorpicker-label,
    .floating .has-value {
      font-size: 0.875rem;
      transform: translateY(-0.75rem);
      background-color: white;
      padding: 0 0.25rem;
      color: #3b82f6;
    }

    .ui-colorpicker-error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .ui-colorpicker-popup {
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 0.25rem;
      padding: 1rem;
      background-color: white;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 50;
      width: 240px;
    }

    .ui-colorpicker-tabs {
      display: flex;
      margin-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .ui-colorpicker-tab {
      padding: 0.5rem 1rem;
      border: none;
      background: none;
      color: #64748b;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .ui-colorpicker-tab.active {
      color: #3b82f6;
      border-bottom: 2px solid #3b82f6;
    }

    .ui-colorpicker-palette {
      margin-bottom: 1rem;
    }

    .ui-colorpicker-saturation {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      border-radius: 0.25rem;
      background-image: linear-gradient(to right, white, red),
                      linear-gradient(to top, black, transparent);
      margin-bottom: 0.5rem;
    }

    .ui-colorpicker-saturation-pointer {
      position: absolute;
      width: 12px;
      height: 12px;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.3);
      transform: translate(-50%, -50%);
    }

    .ui-colorpicker-hue {
      position: relative;
      width: 100%;
      height: 12px;
      background-image: linear-gradient(
        to right,
        #f00 0%,
        #ff0 17%,
        #0f0 33%,
        #0ff 50%,
        #00f 67%,
        #f0f 83%,
        #f00 100%
      );
      border-radius: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .ui-colorpicker-hue-pointer {
      position: absolute;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.3);
      transform: translateX(-50%);
    }

    .ui-colorpicker-alpha {
      position: relative;
      width: 100%;
      height: 12px;
      border-radius: 0.25rem;
      background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                      linear-gradient(-45deg, transparent 75%, #ccc 75%);
      background-size: 8px 8px;
      background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
    }

    .ui-colorpicker-alpha-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 0.25rem;
    }

    .ui-colorpicker-alpha-pointer {
      position: absolute;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      border: 1px solid rgba(0, 0, 0, 0.3);
      transform: translateX(-50%);
    }

    .ui-colorpicker-channel {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .ui-colorpicker-channel label {
      width: 1.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }

    .ui-colorpicker-channel input {
      flex: 1;
      padding: 0.25rem 0.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .ui-colorpicker-preview {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .ui-colorpicker-current,
    .ui-colorpicker-previous {
      width: 2rem;
      height: 2rem;
      border-radius: 0.25rem;
      border: 1px solid #e2e8f0;
    }

    :host(.ui-theme-primary) .ui-colorpicker-input:focus {
      border-color: #3b82f6;
    }

    :host(.ui-size-sm) .ui-colorpicker-input {
      padding: 0.5rem;
      padding-right: 2.5rem;
      font-size: 0.875rem;
    }

    :host(.ui-size-lg) .ui-colorpicker-input {
      padding: 1rem;
      padding-right: 3.5rem;
      font-size: 1.125rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() floatingLabel = false;
  @Input() validation?: ColorPickerValidation;
  @Input() showAlpha = false;
  @Output() colorChange = new EventEmitter<string>();

  @ViewChild('inputElement') inputElement!: ElementRef;
  @ViewChild('saturation') saturationElement!: ElementRef;
  @ViewChild('hue') hueElement!: ElementRef;

  inputId = this.generateComponentId();
  value = '#000000';
  previousColor = '#000000';
  isOpen = false;
  touched = false;
  isValid = true;
  errorMessage = '';

  tabs = ['Palette', 'RGB', 'HSL', 'HEX'];
  activeTab = 'Palette';

  rgb = { r: 0, g: 0, b: 0 };
  hsl = { h: 0, s: 0, l: 0 };
  hex = '000000';
  alpha = 1;

  saturationPosition = { x: 0, y: 0 };
  huePosition = 0;
  alphaPosition = 1;

  private isDragging = false;
  private dragTarget: 'saturation' | 'hue' | 'alpha' | null = null;
  private onChange = (value: string) => {};
  private onTouched = () => {};

  constructor(private elementRef: ElementRef) {
    super();
    
    // Handle dragging
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Close picker when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
        this.isOpen = false;
      }
    });
  }

  writeValue(value: string): void {
    if (!value) {
      value = '#000000';
    }
    this.value = value;
    this.updateColorValues();
    this.validate();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onFocus(): void {
    if (!this.touched) {
      this.touched = true;
      this.onTouched();
    }
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (this.isValidColor(value)) {
      this.value = value;
      this.updateColorValues();
      this.validate();
      this.onChange(value);
      this.colorChange.emit(value);
    }
  }

  onBlur(): void {
    this.validate();
  }

  togglePicker(): void {
    if (this.disabled) return;
    if (!this.isOpen) {
      this.previousColor = this.value;
    }
    this.isOpen = !this.isOpen;
  }

  onSaturationMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragTarget = 'saturation';
    this.updateSaturationPosition(event);
  }

  onHueMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragTarget = 'hue';
    this.updateHuePosition(event);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    switch (this.dragTarget) {
      case 'saturation':
        this.updateSaturationPosition(event);
        break;
      case 'hue':
        this.updateHuePosition(event);
        break;
      case 'alpha':
        this.updateAlphaPosition(event);
        break;
    }
  }

  private onMouseUp(): void {
    this.isDragging = false;
    this.dragTarget = null;
  }

  private updateSaturationPosition(event: MouseEvent): void {
    const rect = this.saturationElement.nativeElement.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * 100;
    let y = ((event.clientY - rect.top) / rect.height) * 100;

    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));

    this.saturationPosition = { x, y };
    this.updateColorFromPositions();
  }

  private updateHuePosition(event: MouseEvent): void {
    const rect = this.hueElement.nativeElement.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    this.huePosition = x;
    this.updateColorFromPositions();
  }

  private updateAlphaPosition(event: MouseEvent): void {
    const rect = this.hueElement.nativeElement.getBoundingClientRect();
    let x = (event.clientX - rect.left) / rect.width;
    x = Math.max(0, Math.min(1, x));
    this.alphaPosition = x;
    this.alpha = x;
    this.updateColorFromPositions();
  }

  private updateColorFromPositions(): void {
    const h = this.huePosition * 360;
    const s = this.saturationPosition.x;
    const v = 100 - this.saturationPosition.y;
    
    this.hsl = this.hsvToHsl(h, s, v);
    this.rgb = this.hslToRgb(this.hsl.h, this.hsl.s, this.hsl.l);
    this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
    
    this.value = `#${this.hex}`;
    this.validate();
    this.onChange(this.value);
    this.colorChange.emit(this.value);
  }

  private updateColorValues(): void {
    const rgb = this.hexToRgb(this.value);
    if (rgb) {
      this.rgb = rgb;
      this.hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      this.hex = this.value.replace('#', '');
      
      // Update positions
      const hsv = this.rgbToHsv(rgb.r, rgb.g, rgb.b);
      this.huePosition = hsv.h / 360;
      this.saturationPosition = {
        x: hsv.s,
        y: 100 - hsv.v
      };
    }
  }

  updateFromRgb(): void {
    this.hsl = this.rgbToHsl(this.rgb.r, this.rgb.g, this.rgb.b);
    this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
    this.value = `#${this.hex}`;
    this.validate();
    this.onChange(this.value);
    this.colorChange.emit(this.value);
  }

  updateFromHsl(): void {
    this.rgb = this.hslToRgb(this.hsl.h, this.hsl.s, this.hsl.l);
    this.hex = this.rgbToHex(this.rgb.r, this.rgb.g, this.rgb.b);
    this.value = `#${this.hex}`;
    this.validate();
    this.onChange(this.value);
    this.colorChange.emit(this.value);
  }

  updateFromHex(): void {
    const rgb = this.hexToRgb(`#${this.hex}`);
    if (rgb) {
      this.rgb = rgb;
      this.hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
      this.value = `#${this.hex}`;
      this.validate();
      this.onChange(this.value);
      this.colorChange.emit(this.value);
    }
  }

  getAlphaGradient(): string {
    return `linear-gradient(to right, transparent, ${this.value})`;
  }

  private isValidColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }

  private validate(): void {
    if (!this.validation) {
      this.isValid = true;
      return;
    }

    if (this.validation.required && !this.value) {
      this.isValid = false;
      this.errorMessage = 'This field is required';
      return;
    }

    if (!this.isValidColor(this.value)) {
      this.isValid = false;
      this.errorMessage = 'Invalid color format';
      return;
    }

    if (this.validation.custom && !this.validation.custom(this.value)) {
      this.isValid = false;
      this.errorMessage = 'Invalid color';
      return;
    }

    this.isValid = true;
    this.errorMessage = '';
  }

  // Color conversion utilities
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }

      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  private rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    };
  }

  private hsvToHsl(h: number, s: number, v: number): { h: number; s: number; l: number } {
    s /= 100;
    v /= 100;
    
    const l = v * (1 - s / 2);
    const sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
    
    return {
      h: Math.round(h),
      s: Math.round(sl * 100),
      l: Math.round(l * 100)
    };
  }
} 