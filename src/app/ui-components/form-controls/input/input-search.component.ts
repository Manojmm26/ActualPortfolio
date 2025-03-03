import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

@Component({
  selector: 'ui-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-search" [class.floating]="floatingLabel">
      <div class="input-container" [class.focused]="focused" [class.filled]="!!value">
        <div class="input-wrapper">
          <span class="search-icon" aria-hidden="true">🔍</span>
          
          <input
            #input
            type="search"
            [value]="value"
            [placeholder]="floatingLabel ? ' ' : placeholder"
            [disabled]="disabled"
            [required]="required"
            [attr.minlength]="minLength"
            [attr.maxlength]="maxLength"
            [attr.autocomplete]="autocomplete"
            (input)="onInput($event)"
            (focus)="onFocus()"
            (blur)="onBlur()"
            (keydown.enter)="onEnter()"
            class="input-field"
          />

          <button
            *ngIf="value && showClear"
            type="button"
            class="clear-button"
            (click)="clearSearch()"
            [attr.aria-label]="'Clear search'">
            <span class="icon" aria-hidden="true">✕</span>
          </button>
        </div>

        <label *ngIf="label" class="input-label" [class.required]="required">
          {{ label }}
        </label>

        <!-- Search Suggestions -->
        <div *ngIf="showSuggestions && suggestions?.length && focused" class="suggestions-list">
          <div
            *ngFor="let suggestion of suggestions; let i = index"
            class="suggestion-item"
            [class.active]="i === activeSuggestionIndex"
            (mousedown)="selectSuggestion(suggestion)"
            (mouseover)="activeSuggestionIndex = i">
            <span class="suggestion-icon" aria-hidden="true">🔍</span>
            {{ suggestion }}
          </div>
        </div>

        <div *ngIf="hint" class="input-hint">{{ hint }}</div>
        <div *ngIf="error" class="input-error">{{ error }}</div>
      </div>
    </div>
  `,
  styleUrls: ['./input-search.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSearchComponent),
      multi: true
    }
  ]
})
export class InputSearchComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = 'Search...';
  @Input() hint = '';
  @Input() error = '';
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() floatingLabel = false;
  @Input() required = false;
  @Input() showClear = true;
  @Input() showSuggestions = true;
  @Input() suggestions: string[] = [];
  @Input() debounceTime = 300;
  @Input() autocomplete = 'off';

  @Output() search = new EventEmitter<string>();
  @Output() suggestionSelected = new EventEmitter<string>();

  value = '';
  focused = false;
  activeSuggestionIndex = -1;
  private debounceTimer?: number;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.activeSuggestionIndex = -1;

    // Debounce search event
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = window.setTimeout(() => {
      this.search.emit(this.value);
    }, this.debounceTime);
  }

  onFocus(): void {
    this.focused = true;
    this.onTouched();
  }

  onBlur(): void {
    // Delay blur to allow suggestion click
    setTimeout(() => {
      this.focused = false;
      this.activeSuggestionIndex = -1;
    }, 200);
  }

  onEnter(): void {
    if (this.activeSuggestionIndex >= 0 && this.suggestions[this.activeSuggestionIndex]) {
      this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
    } else {
      this.search.emit(this.value);
    }
  }

  clearSearch(): void {
    this.value = '';
    this.onChange(this.value);
    this.search.emit(this.value);
    this.activeSuggestionIndex = -1;
  }

  selectSuggestion(suggestion: string): void {
    this.value = suggestion;
    this.onChange(this.value);
    this.suggestionSelected.emit(suggestion);
    this.search.emit(suggestion);
    this.focused = false;
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
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