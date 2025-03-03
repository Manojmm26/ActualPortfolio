import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-date',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-date" [class.floating]="floatingLabel">
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
            class="calendar-button"
            [class.disabled]="disabled"
            (click)="toggleCalendar()"
            [attr.aria-label]="'Open calendar'">
            <span class="calendar-icon">📅</span>
          </button>

          <!-- Calendar Dropdown -->
          <div *ngIf="showCalendar" class="calendar-dropdown">
            <div class="calendar-header">
              <button type="button" (click)="previousMonth()">&lt;</button>
              <span>{{ currentMonth }} {{ currentYear }}</span>
              <button type="button" (click)="nextMonth()">&gt;</button>
            </div>

            <div class="calendar-weekdays">
              <div *ngFor="let day of weekDays" class="weekday">{{ day }}</div>
            </div>

            <div class="calendar-days">
              <button
                *ngFor="let day of calendarDays"
                type="button"
                class="day"
                [class.today]="isToday(day)"
                [class.selected]="isSelected(day)"
                [class.other-month]="!isCurrentMonth(day)"
                [disabled]="!isValidDate(day)"
                (click)="selectDate(day)">
                {{ day.getDate() }}
              </button>
            </div>

            <div class="calendar-footer">
              <button type="button" (click)="selectToday()">Today</button>
              <button type="button" (click)="clearDate()">Clear</button>
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
  styleUrls: ['./input-date.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputDateComponent),
      multi: true
    }
  ]
})
export class InputDateComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Select date';
  @Input() hint = '';
  @Input() error = '';
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() autocomplete = 'off';
  @Input() format = 'MM/dd/yyyy';
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  @Output() dateChange = new EventEmitter<Date | null>();

  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;

  value: Date | null = null;
  displayValue = '';
  focused = false;
  showCalendar = false;

  currentDate = new Date();
  currentMonth = '';
  currentYear = 0;
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarDays: Date[] = [];

  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.updateCalendar();
  }

  onInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.displayValue = input;
    
    // Try to parse the input as a date
    const date = this.parseDate(input);
    if (date && this.isValidDate(date)) {
      this.value = date;
      this.onChange(date);
      this.dateChange.emit(date);
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
    // Format the date on blur if it's valid
    if (this.value) {
      this.displayValue = this.formatDate(this.value);
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.toggleCalendar();
      event.preventDefault();
    } else if (event.key === 'Escape' && this.showCalendar) {
      this.showCalendar = false;
      event.preventDefault();
    }
  }

  toggleCalendar(): void {
    if (!this.disabled) {
      this.showCalendar = !this.showCalendar;
      if (this.showCalendar) {
        if (this.value) {
          this.currentDate = new Date(this.value);
        }
        this.updateCalendar();
      }
    }
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateCalendar();
  }

  selectDate(date: Date): void {
    if (this.isValidDate(date)) {
      this.value = new Date(date);
      this.displayValue = this.formatDate(this.value);
      this.showCalendar = false;
      this.onChange(this.value);
      this.dateChange.emit(this.value);
    }
  }

  selectToday(): void {
    const today = new Date();
    if (this.isValidDate(today)) {
      this.selectDate(today);
    }
  }

  clearDate(): void {
    this.value = null;
    this.displayValue = '';
    this.showCalendar = false;
    this.onChange(null);
    this.dateChange.emit(null);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    return this.value?.getDate() === date.getDate() &&
           this.value?.getMonth() === date.getMonth() &&
           this.value?.getFullYear() === date.getFullYear();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  isValidDate(date: Date): boolean {
    if (this.minDate && date < this.minDate) return false;
    if (this.maxDate && date > this.maxDate) return false;
    return true;
  }

  private updateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    this.currentMonth = new Date(year, month).toLocaleString('default', { month: 'long' });
    this.currentYear = year;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the first day to show (including days from previous month)
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());

    // Get the last day to show (including days from next month)
    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));

    this.calendarDays = [];
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      this.calendarDays.push(new Date(date));
    }
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    switch (this.format) {
      case 'dd/MM/yyyy':
        return `${day}/${month}/${year}`;
      case 'yyyy-MM-dd':
        return `${year}-${month}-${day}`;
      case 'MM/dd/yyyy':
      default:
        return `${month}/${day}/${year}`;
    }
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;

    const parts = value.split(/[-/]/);
    if (parts.length !== 3) return null;

    let year: number, month: number, day: number;

    switch (this.format) {
      case 'dd/MM/yyyy':
        [day, month, year] = parts.map(Number);
        break;
      case 'yyyy-MM-dd':
        [year, month, day] = parts.map(Number);
        break;
      case 'MM/dd/yyyy':
      default:
        [month, day, year] = parts.map(Number);
        break;
    }

    // Adjust month (0-based)
    month--;

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;

    return date;
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | null): void {
    this.value = value;
    this.displayValue = value ? this.formatDate(value) : '';
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

  clearValue(): void {
    this.value = null;
    this.dateChange.emit(null);
    this.onChange(null);
    this.onTouched();
  }
} 