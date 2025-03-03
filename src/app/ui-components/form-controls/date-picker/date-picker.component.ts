import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export type DateView = 'days' | 'months' | 'years';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: 'ui-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
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
  @Input() required = false;
  @Input() placeholder = 'Select date';
  @Input() format = 'MM/dd/yyyy';
  @Input() firstDayOfWeek: DayOfWeek = 0;
  @Input() showWeekNumbers = false;
  @Input() inline = false;
  @Input() range = false;
  @Input() showTime = false;
  @Input() hourFormat: '12' | '24' = '24';
  @Input() stepMinute = 1;
  @Input() stepHour = 1;
  @Input() showSeconds = false;
  @Input() stepSecond = 1;
  @Input() showButtonBar = true;
  @Input() todayButtonLabel = 'Today';
  @Input() clearButtonLabel = 'Clear';
  @Input() yearRange = '20';
  @Input() showOtherMonths = true;
  @Input() selectOtherMonths = true;
  @Input() disabledDates: Date[] = [];
  @Input() disabledDays: number[] = [];
  @Input() highlightedDates: Date[] = [];
  @Input() minDate?: Date;
  @Input() maxDate?: Date;

  @Output() dateSelect = new EventEmitter<Date | Date[]>();
  @Output() monthChange = new EventEmitter<{ month: number; year: number }>();
  @Output() viewChange = new EventEmitter<DateView>();
  @Output() clear = new EventEmitter<void>();
  @Output() today = new EventEmitter<void>();

  value: Date | Date[] | null = null;
  focused = false;
  expanded = false;
  currentView: DateView = 'days';
  viewDate = new Date();
  selectedDates: Date[] = [];
  hoveredDate: Date | null = null;
  weekDays: string[] = [];
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  shortWeekDays: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  private onChange: (value: Date | Date[] | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.initializeWeekDays();
  }

  private initializeWeekDays() {
    this.weekDays = [...Array(7)].map((_, i) => {
      const day = (i + this.firstDayOfWeek) % 7;
      return this.shortWeekDays[day];
    });
  }

  toggleDropdown() {
    if (this.disabled) return;
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.onTouched();
    }
  }

  onClickOutside() {
    this.expanded = false;
  }

  getDaysInMonth(month: number, year: number): Date[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add days from previous month
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthDays = (firstDayOfWeek - this.firstDayOfWeek + 7) % 7;
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i));
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add days from next month
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }

  getWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  isSelected(date: Date): boolean {
    if (!this.value) return false;
    if (Array.isArray(this.value)) {
      return this.value.some(d => this.isSameDay(d, date));
    }
    return this.isSameDay(this.value, date);
  }

  isDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    if (this.disabledDates.some(d => this.isSameDay(d, date))) return true;
    if (this.disabledDays.includes(date.getDay())) return true;
    return false;
  }

  isHighlighted(date: Date): boolean {
    return this.highlightedDates.some(d => this.isSameDay(d, date));
  }

  isOtherMonth(date: Date): boolean {
    return date.getMonth() !== this.viewDate.getMonth();
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  onDateClick(date: Date) {
    if (this.disabled || this.isDisabled(date)) return;

    if (this.range) {
      if (!this.selectedDates.length || this.selectedDates.length === 2) {
        this.selectedDates = [date];
      } else {
        const [start] = this.selectedDates;
        this.selectedDates = start < date ? [start, date] : [date, start];
        this.value = [...this.selectedDates];
        this.onChange(this.value);
        this.dateSelect.emit(this.value);
        if (!this.inline) this.expanded = false;
      }
    } else {
      this.value = date;
      this.onChange(this.value);
      this.dateSelect.emit(this.value);
      if (!this.inline) this.expanded = false;
    }
  }

  onDateHover(date: Date) {
    if (!this.range || this.disabled || this.isDisabled(date)) return;
    this.hoveredDate = date;
  }

  isInRange(date: Date): boolean {
    if (!this.range || this.selectedDates.length !== 2) return false;
    const [start, end] = this.selectedDates;
    return date >= start && date <= end;
  }

  isRangeStart(date: Date): boolean {
    if (!this.range || !this.selectedDates.length) return false;
    return this.isSameDay(date, this.selectedDates[0]);
  }

  isRangeEnd(date: Date): boolean {
    if (!this.range || this.selectedDates.length !== 2) return false;
    return this.isSameDay(date, this.selectedDates[1]);
  }

  navigateMonth(delta: number) {
    const newDate = new Date(this.viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    this.viewDate = newDate;
    this.monthChange.emit({
      month: this.viewDate.getMonth(),
      year: this.viewDate.getFullYear()
    });
  }

  navigateYear(delta: number) {
    const newDate = new Date(this.viewDate);
    newDate.setFullYear(newDate.getFullYear() + delta);
    this.viewDate = newDate;
  }

  changeView(view: DateView) {
    this.currentView = view;
    this.viewChange.emit(view);
  }

  onTodayClick() {
    const today = new Date();
    this.viewDate = today;
    this.onDateClick(today);
    this.today.emit();
  }

  onClearClick() {
    this.value = null;
    this.selectedDates = [];
    this.onChange(null);
    this.clear.emit();
  }

  formatDate(date: Date): string {
    // Simple date formatting - can be enhanced with a proper date formatting library
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | Date[] | null): void {
    this.value = value;
    if (value) {
      this.viewDate = Array.isArray(value) ? value[0] : value;
      this.selectedDates = Array.isArray(value) ? value : [value];
    } else {
      this.selectedDates = [];
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

  getDisplayValue(): string {
    if (!this.value) return this.placeholder;
    if (this.range) {
      const dateRange = this.value as Date[];
      return `${this.formatDate(dateRange[0])} - ${this.formatDate(dateRange[1])}`;
    }
    return this.formatDate(this.value as Date);
  }

  getCalendarWeeks(): Date[][] {
    const firstDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const lastDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 0);
    const weeks: Date[][] = [];
    
    // Start from the last Monday before the first day of the month
    let currentDate = new Date(firstDay);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + (this.firstDayOfWeek === 0 ? 0 : -6));
    
    while (currentDate <= lastDay || weeks.length < 6) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  }

  selectMonth(monthIndex: number): void {
    this.viewDate.setMonth(monthIndex);
    this.changeView('days');
  }

  getYearRange(): number[] {
    const currentYear = this.viewDate.getFullYear();
    const start = currentYear - 5;
    const end = currentYear + 6;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  selectYear(year: number): void {
    this.viewDate.setFullYear(year);
    this.changeView('months');
  }

  // Time-related methods
  getHours(): number {
    if (!this.value) return 0;
    let hours = (this.value as Date).getHours();
    return this.hourFormat === '12' ? (hours % 12 || 12) : hours;
  }

  getMinutes(): number {
    return this.value ? (this.value as Date).getMinutes() : 0;
  }

  getSeconds(): number {
    return this.value ? (this.value as Date).getSeconds() : 0;
  }

  updateHours(hours: number): void {
    if (!this.value) this.value = new Date();
    const date = new Date(this.value as Date);
    if (this.hourFormat === '12') {
      const isPM = this.isPM();
      hours = hours % 12;
      if (isPM) hours += 12;
    }
    date.setHours(hours);
    this.value = date;
    this.onChange(this.value);
  }

  updateMinutes(minutes: number): void {
    if (!this.value) this.value = new Date();
    const date = new Date(this.value as Date);
    date.setMinutes(minutes);
    this.value = date;
    this.onChange(this.value);
  }

  updateSeconds(seconds: number): void {
    if (!this.value) this.value = new Date();
    const date = new Date(this.value as Date);
    date.setSeconds(seconds);
    this.value = date;
    this.onChange(this.value);
  }

  isPM(): boolean {
    return this.value ? (this.value as Date).getHours() >= 12 : false;
  }

  toggleMeridian(isPM: boolean): void {
    if (!this.value) this.value = new Date();
    const date = new Date(this.value as Date);
    let hours = date.getHours();
    const currentIsPM = hours >= 12;
    
    if (isPM !== currentIsPM) {
      hours = isPM ? hours + 12 : hours - 12;
      date.setHours(hours);
      this.value = date;
      this.onChange(this.value);
    }
  }
} 