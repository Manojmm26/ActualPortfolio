import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

export interface DatePickerValidation {
  required?: boolean;
  min?: Date;
  max?: Date;
  custom?: (value: Date) => boolean;
}

@Component({
  selector: 'ui-datepicker',
  template: `
    <div class="ui-datepicker-wrapper" [class.floating]="floatingLabel">
      <div class="ui-datepicker-input-group">
        <input
          #inputElement
          type="text"
          [id]="inputId"
          [value]="formatDate(value)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [attr.aria-label]="label"
          [attr.aria-invalid]="!isValid"
          (focus)="onFocus()"
          (click)="toggleCalendar()"
          (keydown.enter)="toggleCalendar()"
          class="ui-datepicker-input"
          readonly
        />
        <button
          type="button"
          class="ui-datepicker-toggle"
          [disabled]="disabled"
          (click)="toggleCalendar()"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="ui-datepicker-icon">
            <path d="M19 4h-1V3a1 1 0 0 0-2 0v1H8V3a1 1 0 0 0-2 0v1H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
          </svg>
        </button>
      </div>

      <label 
        [for]="inputId"
        class="ui-datepicker-label"
        [class.has-value]="!!value"
      >{{ label }}</label>

      <div class="ui-datepicker-error" *ngIf="!isValid && touched">
        {{ errorMessage }}
      </div>

      <div class="ui-datepicker-calendar" *ngIf="isOpen">
        <div class="ui-datepicker-header">
          <button
            type="button"
            class="ui-datepicker-nav-btn"
            (click)="previousMonth()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <div class="ui-datepicker-header-label">
            {{ currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' }) }}
          </div>
          <button
            type="button"
            class="ui-datepicker-nav-btn"
            (click)="nextMonth()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </button>
        </div>

        <div class="ui-datepicker-weekdays">
          <div class="ui-datepicker-weekday" *ngFor="let day of weekDays">
            {{ day }}
          </div>
        </div>

        <div class="ui-datepicker-days">
          <div
            *ngFor="let day of calendarDays"
            class="ui-datepicker-day"
            [class.other-month]="day.otherMonth"
            [class.selected]="isSelected(day.date)"
            [class.today]="isToday(day.date)"
            [class.disabled]="isDisabled(day.date)"
            (click)="selectDate(day)"
          >
            {{ day.date.getDate() }}
          </div>
        </div>

        <div class="ui-datepicker-footer" *ngIf="showToday">
          <button
            type="button"
            class="ui-datepicker-today-btn"
            (click)="selectToday()"
          >
            Today
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ui-datepicker-wrapper {
      position: relative;
      width: 100%;
    }

    .ui-datepicker-input-group {
      position: relative;
      display: flex;
      align-items: center;
    }

    .ui-datepicker-input {
      width: 100%;
      padding: 0.75rem;
      padding-right: 2.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      font-size: 1rem;
      line-height: 1.5;
      background-color: white;
      cursor: pointer;
    }

    .ui-datepicker-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .ui-datepicker-toggle {
      position: absolute;
      right: 0.5rem;
      padding: 0.25rem;
      border: none;
      background: none;
      cursor: pointer;
      color: #64748b;
    }

    .ui-datepicker-toggle:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ui-datepicker-icon {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }

    .ui-datepicker-label {
      position: absolute;
      left: 0.75rem;
      top: 0.75rem;
      color: #64748b;
      transition: all 0.2s;
      pointer-events: none;
    }

    .floating .ui-datepicker-input {
      padding-top: 1.25rem;
    }

    .floating .ui-datepicker-label,
    .floating .has-value {
      font-size: 0.875rem;
      transform: translateY(-0.75rem);
      background-color: white;
      padding: 0 0.25rem;
      color: #3b82f6;
    }

    .ui-datepicker-error {
      color: #ef4444;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .ui-datepicker-calendar {
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
    }

    .ui-datepicker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .ui-datepicker-nav-btn {
      padding: 0.25rem;
      border: none;
      background: none;
      cursor: pointer;
      color: #64748b;
    }

    .ui-datepicker-nav-btn svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }

    .ui-datepicker-header-label {
      font-weight: 500;
      color: #1e293b;
    }

    .ui-datepicker-weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
      margin-bottom: 0.5rem;
    }

    .ui-datepicker-weekday {
      text-align: center;
      font-size: 0.875rem;
      font-weight: 500;
      color: #64748b;
    }

    .ui-datepicker-days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 0.25rem;
    }

    .ui-datepicker-day {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 2.25rem;
      font-size: 0.875rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ui-datepicker-day:hover:not(.disabled):not(.selected) {
      background-color: #f1f5f9;
    }

    .ui-datepicker-day.other-month {
      color: #94a3b8;
    }

    .ui-datepicker-day.selected {
      background-color: #3b82f6;
      color: white;
    }

    .ui-datepicker-day.today:not(.selected) {
      border: 1px solid #3b82f6;
      color: #3b82f6;
    }

    .ui-datepicker-day.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .ui-datepicker-footer {
      margin-top: 1rem;
      text-align: center;
    }

    .ui-datepicker-today-btn {
      padding: 0.5rem 1rem;
      border: none;
      background-color: #f1f5f9;
      color: #1e293b;
      font-size: 0.875rem;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .ui-datepicker-today-btn:hover {
      background-color: #e2e8f0;
    }

    :host(.ui-theme-primary) .ui-datepicker-input:focus {
      border-color: #3b82f6;
    }

    :host(.ui-size-sm) .ui-datepicker-input {
      padding: 0.5rem;
      padding-right: 2rem;
      font-size: 0.875rem;
    }

    :host(.ui-size-lg) .ui-datepicker-input {
      padding: 1rem;
      padding-right: 3rem;
      font-size: 1.125rem;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() floatingLabel = false;
  @Input() validation?: DatePickerValidation;
  @Input() format = 'MM/dd/yyyy';
  @Input() showToday = true;
  @Output() dateChange = new EventEmitter<Date>();

  @ViewChild('inputElement') inputElement!: ElementRef;

  inputId = this.generateComponentId();
  value: Date | null = null;
  isOpen = false;
  touched = false;
  isValid = true;
  errorMessage = '';
  currentMonth = new Date();
  weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  calendarDays: Array<{ date: Date; otherMonth: boolean }> = [];

  private onChange = (value: Date | null) => {};
  private onTouched = () => {};

  constructor(private elementRef: ElementRef) {
    super();
    this.generateCalendarDays();
    
    // Close calendar when clicking outside
    document.addEventListener('click', (event) => {
      if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
        this.isOpen = false;
      }
    });
  }

  writeValue(value: Date | null): void {
    this.value = value;
    if (value) {
      this.currentMonth = new Date(value.getFullYear(), value.getMonth(), 1);
      this.generateCalendarDays();
    }
    this.validate();
  }

  registerOnChange(fn: (value: Date | null) => void): void {
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

  toggleCalendar(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.currentMonth = this.value ? new Date(this.value.getFullYear(), this.value.getMonth(), 1) : new Date();
      this.generateCalendarDays();
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendarDays();
  }

  selectDate(day: { date: Date; otherMonth: boolean }): void {
    if (this.isDisabled(day.date)) return;
    
    this.value = day.date;
    this.isOpen = false;
    this.validate();
    this.onChange(this.value);
    this.dateChange.emit(this.value);
  }

  selectToday(): void {
    const today = new Date();
    if (!this.isDisabled(today)) {
      this.selectDate({ date: today, otherMonth: false });
    }
  }

  isSelected(date: Date): boolean {
    return this.value?.getTime() === date.getTime();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isDisabled(date: Date): boolean {
    if (this.disabled) return true;
    if (!this.validation) return false;

    if (this.validation.min && date < this.validation.min) return true;
    if (this.validation.max && date > this.validation.max) return true;
    if (this.validation.custom && !this.validation.custom(date)) return true;

    return false;
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    
    let formatted = this.format;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    formatted = formatted.replace('yyyy', year.toString());
    formatted = formatted.replace('MM', month.toString().padStart(2, '0'));
    formatted = formatted.replace('dd', day.toString().padStart(2, '0'));

    return formatted;
  }

  private generateCalendarDays(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the first Sunday before the first day of the month
    const start = new Date(firstDay);
    start.setDate(start.getDate() - start.getDay());

    // Get the last Saturday after the last day of the month
    const end = new Date(lastDay);
    end.setDate(end.getDate() + (6 - end.getDay()));

    this.calendarDays = [];
    let current = new Date(start);

    while (current <= end) {
      this.calendarDays.push({
        date: new Date(current),
        otherMonth: current.getMonth() !== month
      });
      current.setDate(current.getDate() + 1);
    }
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

    if (this.value) {
      if (this.validation.min && this.value < this.validation.min) {
        this.isValid = false;
        this.errorMessage = `Date must be after ${this.formatDate(this.validation.min)}`;
        return;
      }

      if (this.validation.max && this.value > this.validation.max) {
        this.isValid = false;
        this.errorMessage = `Date must be before ${this.formatDate(this.validation.max)}`;
        return;
      }

      if (this.validation.custom && !this.validation.custom(this.value)) {
        this.isValid = false;
        this.errorMessage = 'Invalid date';
        return;
      }
    }

    this.isValid = true;
    this.errorMessage = '';
  }
} 