import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface CountryCode {
  code: string;
  dial: string;
  flag: string;
  name: string;
}

@Component({
  selector: 'ui-phone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-phone" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="!!value">
        <div class="input-wrapper">
          <!-- Country Code Selector -->
          <button
            type="button"
            class="country-select"
            [class.disabled]="disabled"
            (click)="toggleCountryList()"
            [attr.aria-label]="'Select country code'">
            <span class="flag" aria-hidden="true">{{ selectedCountry.flag }}</span>
            <span class="dial-code">{{ selectedCountry.dial }}</span>
            <span class="arrow" [class.expanded]="showCountryList">▼</span>
          </button>

          <!-- Country List Dropdown -->
          <div *ngIf="showCountryList" class="country-list">
            <div class="search-box">
              <input
                type="text"
                [placeholder]="'Search countries...'"
                [(ngModel)]="countrySearch"
                (input)="filterCountries()"
                (click)="$event.stopPropagation()"
              />
            </div>
            <div class="countries">
              <button
                *ngFor="let country of filteredCountries"
                type="button"
                class="country-option"
                [class.selected]="country.code === selectedCountry.code"
                (click)="selectCountry(country)">
                <span class="flag" aria-hidden="true">{{ country.flag }}</span>
                <span class="country-name">{{ country.name }}</span>
                <span class="dial-code">{{ country.dial }}</span>
              </button>
            </div>
          </div>

          <!-- Phone Input -->
          <input
            #input
            type="tel"
            [value]="displayValue"
            [placeholder]="floatingLabel ? ' ' : placeholder"
            [disabled]="disabled"
            [required]="required"
            [attr.maxlength]="maxLength"
            [attr.autocomplete]="autocomplete"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            class="input-field"
          />
        </div>

        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>

        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-phone.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputPhoneComponent),
      multi: true
    }
  ]
})
export class InputPhoneComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Phone number';
  @Input() hint = '';
  @Input() error = '';
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() maxLength = 15;
  @Input() autocomplete = 'tel';
  @Input() defaultCountry = 'US';

  @Output() countryChange = new EventEmitter<CountryCode>();

  value = '';
  displayValue = '';
  focused = false;
  showCountryList = false;
  countrySearch = '';

  selectedCountry: CountryCode = {
    code: 'US',
    dial: '+1',
    flag: '🇺🇸',
    name: 'United States'
  };

  countries: CountryCode[] = [
    { code: 'US', dial: '+1', flag: '🇺🇸', name: 'United States' },
    { code: 'GB', dial: '+44', flag: '🇬🇧', name: 'United Kingdom' },
    { code: 'CA', dial: '+1', flag: '🇨🇦', name: 'Canada' },
    { code: 'AU', dial: '+61', flag: '🇦🇺', name: 'Australia' },
    { code: 'DE', dial: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: 'FR', dial: '+33', flag: '🇫🇷', name: 'France' },
    { code: 'IT', dial: '+39', flag: '🇮🇹', name: 'Italy' },
    { code: 'ES', dial: '+34', flag: '🇪🇸', name: 'Spain' },
    { code: 'BR', dial: '+55', flag: '🇧🇷', name: 'Brazil' },
    { code: 'IN', dial: '+91', flag: '🇮🇳', name: 'India' },
    { code: 'CN', dial: '+86', flag: '🇨🇳', name: 'China' },
    { code: 'JP', dial: '+81', flag: '🇯🇵', name: 'Japan' }
  ];

  filteredCountries: CountryCode[] = this.countries;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.selectedCountry = this.countries.find(c => c.code === this.defaultCountry) || this.countries[0];
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value.replace(/[^\d]/g, '');
    this.displayValue = this.formatPhoneNumber(this.value);
    this.onChange(this.selectedCountry.dial + this.value);
  }

  onFocus(): void {
    this.focused = true;
    this.onTouched();
  }

  onBlur(): void {
    this.focused = false;
  }

  toggleCountryList(): void {
    if (!this.disabled) {
      this.showCountryList = !this.showCountryList;
      if (this.showCountryList) {
        this.countrySearch = '';
        this.filteredCountries = this.countries;
      }
    }
  }

  selectCountry(country: CountryCode): void {
    this.selectedCountry = country;
    this.showCountryList = false;
    this.countryChange.emit(country);
    this.onChange(this.selectedCountry.dial + this.value);
  }

  filterCountries(): void {
    const search = this.countrySearch.toLowerCase();
    this.filteredCountries = this.countries.filter(country =>
      country.name.toLowerCase().includes(search) ||
      country.dial.includes(search) ||
      country.code.toLowerCase().includes(search)
    );
  }

  private formatPhoneNumber(value: string): string {
    if (!value) return '';

    // Format based on country
    switch (this.selectedCountry.code) {
      case 'US':
      case 'CA':
        return this.formatNorthAmerican(value);
      case 'GB':
        return this.formatUK(value);
      default:
        return this.formatGeneric(value);
    }
  }

  private formatNorthAmerican(value: string): string {
    const groups = value.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!groups) return value;
    
    let formatted = '';
    if (groups[1]) formatted += '(' + groups[1];
    if (groups[2]) formatted += ') ' + groups[2];
    if (groups[3]) formatted += '-' + groups[3];
    
    return formatted;
  }

  private formatUK(value: string): string {
    const groups = value.match(/^(\d{0,4})(\d{0,6})(\d{0,4})$/);
    if (!groups) return value;
    
    let formatted = '';
    if (groups[1]) formatted += groups[1];
    if (groups[2]) formatted += ' ' + groups[2];
    if (groups[3]) formatted += ' ' + groups[3];
    
    return formatted;
  }

  private formatGeneric(value: string): string {
    return value.replace(/(\d{3})(?=\d)/g, '$1 ');
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    if (value) {
      // Extract country code and number
      const match = value.match(/^\+(\d+)(.*)$/);
      if (match) {
        const dialCode = '+' + match[1];
        const country = this.countries.find(c => c.dial === dialCode);
        if (country) {
          this.selectedCountry = country;
          this.value = match[2].replace(/[^\d]/g, '');
          this.displayValue = this.formatPhoneNumber(this.value);
        }
      }
    } else {
      this.value = '';
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