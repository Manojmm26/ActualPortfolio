import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export type ColorFormat = 'hex' | 'rgb' | 'hsl';

const COLOR_FORMATS: ColorFormat[] = ['hex', 'rgb', 'hsl'];

@Component({
  selector: 'ui-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss'],
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
  @Input() required = false;
  @Input() format: ColorFormat = 'hex';
  @Input() showAlpha = false;
  @Input() showInput = true;
  @Input() showRecent = true;
  @Input() maxRecent = 8;
  @Input() presetColors: string[] = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
    '#795548', '#9e9e9e', '#607d8b', '#ffffff'
  ];

  @Output() colorChange = new EventEmitter<Color>();
  @Output() formatChange = new EventEmitter<ColorFormat>();

  readonly formats = COLOR_FORMATS;
  value: Color = { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
  expanded = false;
  focused = false;
  recentColors: Color[] = [];
  selectedFormat: ColorFormat = 'hex';
  hueValue = 0;
  saturationValue = 100;
  lightnessValue = 50;
  alphaValue = 100;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  toggleDropdown(): void {
    if (this.disabled) return;
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.onTouched();
    }
  }

  onClickOutside(): void {
    this.expanded = false;
  }

  onColorSelect(hex: string): void {
    if (this.disabled) return;
    this.updateColor(hex);
  }

  onHueChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.hueValue = Number(input.value);
    this.updateFromHSL();
  }

  onSaturationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.saturationValue = Number(input.value);
    this.updateFromHSL();
  }

  onLightnessChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.lightnessValue = Number(input.value);
    this.updateFromHSL();
  }

  onAlphaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.alphaValue = Number(input.value);
    this.updateFromHSL();
  }

  onHexInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onColorSelect(input.value);
  }

  onRgbInput(event: Event, channel: 'r' | 'g' | 'b'): void {
    const input = event.target as HTMLInputElement;
    const value = +input.value;
    const rgb = { ...this.value.rgb, [channel]: value };
    this.onColorSelect(this.rgbToHex(rgb.r, rgb.g, rgb.b));
  }

  onHslInput(event: Event, channel: 'h' | 's' | 'l'): void {
    const input = event.target as HTMLInputElement;
    const value = +input.value;
    
    switch (channel) {
      case 'h':
        this.hueValue = value;
        break;
      case 's':
        this.saturationValue = value;
        break;
      case 'l':
        this.lightnessValue = value;
        break;
    }
    
    this.updateFromHSL();
  }

  onFormatChange(format: 'hex' | 'rgb' | 'hsl'): void {
    this.selectedFormat = format;
    this.formatChange.emit(format);
  }

  private updateColor(hex: string): void {
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    this.value = { hex, rgb, hsl };
    this.hueValue = hsl.h;
    this.saturationValue = hsl.s;
    this.lightnessValue = hsl.l;
    
    this.addToRecent(this.value);
    this.onChange(this.getOutputValue());
    this.colorChange.emit(this.value);
  }

  private updateFromHSL(): void {
    const rgb = this.hslToRgb(this.hueValue, this.saturationValue, this.lightnessValue);
    const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
    
    this.value = {
      hex,
      rgb,
      hsl: { h: this.hueValue, s: this.saturationValue, l: this.lightnessValue }
    };
    
    this.onChange(this.getOutputValue());
    this.colorChange.emit(this.value);
  }

  private addToRecent(color: Color): void {
    if (!this.showRecent) return;
    
    const exists = this.recentColors.findIndex(c => c.hex === color.hex);
    if (exists > -1) {
      this.recentColors.splice(exists, 1);
    }
    
    this.recentColors.unshift(color);
    if (this.recentColors.length > this.maxRecent) {
      this.recentColors.pop();
    }
  }

  private getOutputValue(): string | { r: number; g: number; b: number } | { h: number; s: number; l: number } {
    switch (this.format) {
      case 'rgb': return this.value.rgb;
      case 'hsl': return this.value.hsl;
      default: return this.value.hex;
    }
  }

  // Color conversion utilities
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
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

    let r: number, g: number, b: number;

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

  // ControlValueAccessor implementation
  writeValue(value: string | { r: number; g: number; b: number } | { h: number; s: number; l: number }): void {
    if (!value) {
      this.value = { hex: '#000000', rgb: { r: 0, g: 0, b: 0 }, hsl: { h: 0, s: 0, l: 0 } };
      return;
    }

    if (typeof value === 'string') {
      this.updateColor(value);
    } else if ('r' in value) {
      const hex = this.rgbToHex(value.r, value.g, value.b);
      this.updateColor(hex);
    } else if ('h' in value) {
      const rgb = this.hslToRgb(value.h, value.s, value.l);
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b);
      this.updateColor(hex);
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