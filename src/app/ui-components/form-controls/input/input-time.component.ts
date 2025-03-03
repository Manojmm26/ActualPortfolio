import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-time',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-time" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="!!value">
        <div class="input-wrapper">
          <input
            #input
            type="text"
            [value]="displayValue"
            [placeholder]="floatingLabel ? ' ' : placeholder"
            [disabled]="disabled"
            [required]="required"
            [attr.autocomplete]="autocomplete"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown)="onKeyDown($event)"
            class="input-field"
          />
          
          <button
            type="button"
            class="time-button"
            [class.disabled]="disabled"
            (click)="toggleTimePicker()"
            [attr.aria-label]="'Open time picker'">
            <span class="time-icon">🕒</span>
          </button>

          <!-- Time Picker Dropdown -->
          <div *ngIf="showTimePicker" class="time-dropdown">
            <div class="time-picker">
              <!-- Hours -->
              <div class="time-section">
                <button type="button" (click)="incrementHour()" class="spinner-button">▲</button>
                <input
                  type="number"
                  [min]="0"
                  [max]="hourFormat === '12' ? 12 : 23"
                  [value]="hours"
                  (change)="onHourChange($event)"
                  class="time-input"
                />
                <button type="button" (click)="decrementHour()" class="spinner-button">▼</button>
                <span class="time-label">Hour</span>
              </div>

              <div class="time-separator">:</div>

              <!-- Minutes -->
              <div class="time-section">
                <button type="button" (click)="incrementMinute()" class="spinner-button">▲</button>
                <input
                  type="number"
                  min="0"
                  max="59"
                  [value]="minutes"
                  (change)="onMinuteChange($event)"
                  class="time-input"
                />
                <button type="button" (click)="decrementMinute()" class="spinner-button">▼</button>
                <span class="time-label">Min</span>
              </div>

              <!-- Seconds (if enabled) -->
              <ng-container *ngIf="showSeconds">
                <div class="time-separator">:</div>
                <div class="time-section">
                  <button type="button" (click)="incrementSecond()" class="spinner-button">▲</button>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    [value]="seconds"
                    (change)="onSecondChange($event)"
                    class="time-input"
                  />
                  <button type="button" (click)="decrementSecond()" class="spinner-button">▼</button>
                  <span class="time-label">Sec</span>
                </div>
              </ng-container>

              <!-- AM/PM (12-hour format) -->
              <div *ngIf="hourFormat === '12'" class="meridiem-section">
                <button
                  type="button"
                  [class.active]="!isPM"
                  (click)="toggleMeridiem(false)"
                  class="meridiem-button">
                  AM
                </button>
                <button
                  type="button"
                  [class.active]="isPM"
                  (click)="toggleMeridiem(true)"
                  class="meridiem-button">
                  PM
                </button>
              </div>
            </div>

            <div class="time-footer">
              <button type="button" (click)="setCurrentTime()">Now</button>
              <button type="button" (click)="clearTime()">Clear</button>
            </div>
          </div>
        </div>

        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>

        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-time.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTimeComponent),
      multi: true
    }
  ]
})
export class InputTimeComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select time';
  @Input() hint = '';
  @Input() error = '';
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() autocomplete = 'off';
  @Input() hourFormat: '12' | '24' = '24';
  @Input() showSeconds = false;
  @Input() stepHour = 1;
  @Input() stepMinute = 1;
  @Input() stepSecond = 1;
  @Input() minTime?: string;
  @Input() maxTime?: string;

  @Output() timeChange = new EventEmitter<string | null>();

  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  value: string | null = null;
  displayValue = '';
  focused = false;
  showTimePicker = false;

  hours = 0;
  minutes = 0;
  seconds = 0;
  isPM = false;

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.displayValue = input;
    
    // Try to parse the input as time
    const time = this.parseTime(input);
    if (time && this.isValidTime(time)) {
      this.value = time;
      this.updateTimeComponents(time);
      this.onChange(time);
      this.timeChange.emit(time);
    } else {
      this.value = null;
      this.onChange(null);
    }
  }

  onFocus(): void {
    this.focused = true;
    this.onTouched();
  }

  onBlur(): void {
    this.focused = false;
    // Format the time on blur if it's valid
    if (this.value) {
      this.displayValue = this.formatTime(this.value);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleTimePicker();
      event.preventDefault();
    } else if (event.key === 'Escape' && this.showTimePicker) {
      this.showTimePicker = false;
      event.preventDefault();
    }
  }

  toggleTimePicker(): void {
    if (!this.disabled) {
      this.showTimePicker = !this.showTimePicker;
    }
  }

  incrementHour(): void {
    const max = this.hourFormat === '12' ? 12 : 23;
    this.hours = (this.hours + this.stepHour) % (max + 1);
    if (this.hours === 0 && this.hourFormat === '12') this.hours = 12;
    this.updateValue();
  }

  decrementHour(): void {
    const max = this.hourFormat === '12' ? 12 : 23;
    this.hours = (this.hours - this.stepHour + (max + 1)) % (max + 1);
    if (this.hours === 0 && this.hourFormat === '12') this.hours = 12;
    this.updateValue();
  }

  incrementMinute(): void {
    this.minutes = (this.minutes + this.stepMinute) % 60;
    this.updateValue();
  }

  decrementMinute(): void {
    this.minutes = (this.minutes - this.stepMinute + 60) % 60;
    this.updateValue();
  }

  incrementSecond(): void {
    this.seconds = (this.seconds + this.stepSecond) % 60;
    this.updateValue();
  }

  decrementSecond(): void {
    this.seconds = (this.seconds - this.stepSecond + 60) % 60;
    this.updateValue();
  }

  toggleMeridiem(isPM: boolean): void {
    this.isPM = isPM;
    this.updateValue();
  }

  onHourChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    const max = this.hourFormat === '12' ? 12 : 23;
    
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(value, max));
    
    this.hours = value;
    this.updateValue();
  }

  onMinuteChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(value, 59));
    
    this.minutes = value;
    this.updateValue();
  }

  onSecondChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(value, 59));
    
    this.seconds = value;
    this.updateValue();
  }

  setCurrentTime(): void {
    const now = new Date();
    this.hours = this.hourFormat === '12' ? now.getHours() % 12 || 12 : now.getHours();
    this.minutes = now.getMinutes();
    this.seconds = now.getSeconds();
    this.isPM = now.getHours() >= 12;
    this.updateValue();
  }

  clearTime(): void {
    this.value = null;
    this.displayValue = '';
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.isPM = false;
    this.showTimePicker = false;
    this.onChange(null);
    this.timeChange.emit(null);
  }

  clearValue(): void {
    this.value = null;
    this.timeChange.emit(null);
    this.onChange(null);
    this.onTouched();
  }

  private updateValue(): void {
    let hours = this.hours;
    if (this.hourFormat === '12' && this.isPM && hours !== 12) {
      hours += 12;
    } else if (this.hourFormat === '12' && !this.isPM && hours === 12) {
      hours = 0;
    }

    const time = `${hours.toString().padStart(2, '0')}:${this.minutes.toString().padStart(2, '0')}${
      this.showSeconds ? ':' + this.seconds.toString().padStart(2, '0') : ''
    }`;

    if (this.isValidTime(time)) {
      this.value = time;
      this.displayValue = this.formatTime(time);
      this.onChange(time);
      this.timeChange.emit(time);
    }
  }

  private updateTimeComponents(time: string): void {
    const [hoursStr, minutesStr, secondsStr] = time.split(':');
    let hours = parseInt(hoursStr, 10);
    
    if (this.hourFormat === '12') {
      this.isPM = hours >= 12;
      hours = hours % 12 || 12;
    }
    
    this.hours = hours;
    this.minutes = parseInt(minutesStr, 10);
    this.seconds = secondsStr ? parseInt(secondsStr, 10) : 0;
  }

  private formatTime(time: string): string {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    const period = this.hourFormat === '12' ? (hours >= 12 ? ' PM' : ' AM') : '';
    const displayHours = this.hourFormat === '12' ? (hours % 12 || 12) : hours;
    
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${
      this.showSeconds ? ':' + (seconds || 0).toString().padStart(2, '0') : ''
    }${period}`;
  }

  private parseTime(value: string): string | null {
    if (!value) return null;

    // Remove AM/PM and trim
    const timePart = value.replace(/[APap][Mm]/, '').trim();
    const parts = timePart.split(':');
    if (parts.length < 2) return null;

    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

    // Check for valid numbers
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;

    // Adjust hours for 12-hour format
    if (this.hourFormat === '12') {
      const isPM = /[Pp][Mm]/.test(value);
      if (hours === 12) hours = isPM ? 12 : 0;
      else if (isPM) hours += 12;
    }

    // Validate ranges
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
      return null;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}${
      this.showSeconds ? ':' + seconds.toString().padStart(2, '0') : ''
    }`;
  }

  private isValidTime(time: string): boolean {
    if (!time) return false;

    const [hours, minutes, seconds] = time.split(':').map(Number);
    if (this.minTime) {
      const [minHours, minMinutes, minSeconds] = this.minTime.split(':').map(Number);
      const timeValue = hours * 3600 + minutes * 60 + (seconds || 0);
      const minValue = minHours * 3600 + minMinutes * 60 + (minSeconds || 0);
      if (timeValue < minValue) return false;
    }

    if (this.maxTime) {
      const [maxHours, maxMinutes, maxSeconds] = this.maxTime.split(':').map(Number);
      const timeValue = hours * 3600 + minutes * 60 + (seconds || 0);
      const maxValue = maxHours * 3600 + maxMinutes * 60 + (maxSeconds || 0);
      if (timeValue > maxValue) return false;
    }

    return true;
  }

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    this.value = value;
    if (value) {
      this.updateTimeComponents(value);
      this.displayValue = this.formatTime(value);
    } else {
      this.displayValue = '';
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