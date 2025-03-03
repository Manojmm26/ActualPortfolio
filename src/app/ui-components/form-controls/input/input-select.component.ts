import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-select">
      <div class="select-container" [class.focused]="focused" [class.filled]="hasValue">
        <!-- Selected Value Display -->
        <div class="select-wrapper"
             (click)="toggleDropdown()"
             [class.disabled]="disabled"
             role="combobox"
             [attr.aria-expanded]="expanded"
             [attr.aria-disabled]="disabled"
             [attr.aria-controls]="'select-dropdown-' + id"
             [attr.aria-activedescendant]="activeOptionId">
          
          <!-- Multiple Selection Tags -->
          <div *ngIf="multiple && selectedOptions.length > 0" class="selected-tags">
            <div *ngFor="let option of selectedOptions" class="tag">
              {{ option.label }}
              <button type="button"
                      class="remove-tag"
                      (click)="removeOption(option, $event)"
                      [attr.aria-label]="'Remove ' + option.label">
                ×
              </button>
            </div>
          </div>

          <!-- Single Selection Display -->
          <div *ngIf="!multiple" class="selected-value" [class.placeholder]="!selectedOptions.length">
            {{ selectedOptions.length ? selectedOptions[0].label : placeholder }}
          </div>

          <!-- Clear Button -->
          <button *ngIf="clearable && hasValue && !disabled"
                  type="button"
                  class="clear-button"
                  (click)="clearSelection($event)"
                  [attr.aria-label]="'Clear selection'">
            ×
          </button>

          <!-- Dropdown Arrow -->
          <div class="dropdown-arrow" [class.expanded]="expanded">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>

        <!-- Dropdown Menu -->
        <div *ngIf="expanded"
             class="select-dropdown"
             [id]="'select-dropdown-' + id"
             role="listbox"
             [attr.aria-multiselectable]="multiple"
             (click)="$event.stopPropagation()">
          
          <!-- Search Input -->
          <div *ngIf="searchable" class="search-container">
            <input #searchInput
                   type="text"
                   class="search-input"
                   [placeholder]="searchPlaceholder"
                   [ngModel]="searchQuery"
                   (ngModelChange)="onSearch($event)"
                   (click)="$event.stopPropagation()"
                   (keydown)="onSearchKeyDown($event)">
          </div>

          <!-- Options List -->
          <div class="options-container" *ngIf="filteredOptions.length; else noOptions">
            <ng-container *ngFor="let group of groupedOptions">
              <!-- Group Header -->
              <div *ngIf="group.group" class="option-group">
                {{ group.group }}
              </div>

              <!-- Group Options -->
              <div *ngFor="let option of group.options"
                   class="option"
                   [class.selected]="isSelected(option)"
                   [class.active]="option.value === activeValue"
                   [class.disabled]="option.disabled"
                   [id]="'option-' + id + '-' + option.value"
                   role="option"
                   [attr.aria-selected]="isSelected(option)"
                   [attr.aria-disabled]="option.disabled"
                   (click)="!option.disabled && toggleOption(option)">
                <div class="option-content">
                  <div *ngIf="multiple" class="checkbox">
                    <input type="checkbox"
                           [checked]="isSelected(option)"
                           [disabled]="option.disabled"
                           (click)="$event.stopPropagation()">
                  </div>
                  {{ option.label }}
                </div>
              </div>
            </ng-container>
          </div>

          <!-- No Options Template -->
          <ng-template #noOptions>
            <div class="no-options">
              {{ noOptionsText }}
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true
    }
  ]
})
export class InputSelectComponent extends BaseComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() multiple = false;
  @Input() searchable = false;
  @Input() clearable = true;
  @Input() placeholder = 'Select...';
  @Input() searchPlaceholder = 'Search...';
  @Input() noOptionsText = 'No options available';

  @Output() optionSelect = new EventEmitter<SelectOption>();
  @Output() optionDeselect = new EventEmitter<SelectOption>();
  @Output() search = new EventEmitter<string>();

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  id = 'select-' + Math.random().toString(36).substring(2);
  expanded = false;
  focused = false;
  searchQuery = '';
  activeValue: any = null;
  selectedOptions: SelectOption[] = [];
  filteredOptions: SelectOption[] = [];
  groupedOptions: { group: string; options: SelectOption[] }[] = [];
  hasValue = false;
  activeOptionId: string | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
    this.updateGroupedOptions();
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    
    this.expanded = !this.expanded;
    if (this.expanded) {
      this.focused = true;
      if (this.searchable) {
        setTimeout(() => this.searchInput?.nativeElement.focus(), 0);
      }
    } else {
      this.focused = false;
      this.searchQuery = '';
      this.filteredOptions = [...this.options];
      this.updateGroupedOptions();
    }
  }

  onSearch(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.filteredOptions = this.options.filter(option =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
    this.updateGroupedOptions();
    this.search.emit(query);
  }

  onSearchKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.navigateOptions('next');
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateOptions('prev');
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeValue !== null) {
          const option = this.filteredOptions.find(opt => opt.value === this.activeValue);
          if (option && !option.disabled) {
            this.toggleOption(option);
          }
        }
        break;
      case 'Escape':
        this.expanded = false;
        break;
    }
  }

  navigateOptions(direction: 'next' | 'prev'): void {
    const options = this.filteredOptions.filter(opt => !opt.disabled);
    if (!options.length) return;

    const currentIndex = options.findIndex(opt => opt.value === this.activeValue);
    let nextIndex: number;

    if (currentIndex === -1) {
      nextIndex = direction === 'next' ? 0 : options.length - 1;
    } else {
      nextIndex = direction === 'next'
        ? (currentIndex + 1) % options.length
        : (currentIndex - 1 + options.length) % options.length;
    }

    this.activeValue = options[nextIndex].value;
    this.activeOptionId = `option-${this.id}-${this.activeValue}`;
  }

  toggleOption(option: SelectOption): void {
    if (this.disabled || option.disabled) return;

    if (this.multiple) {
      const index = this.selectedOptions.findIndex(opt => opt.value === option.value);
      if (index === -1) {
        this.selectedOptions = [...this.selectedOptions, option];
        this.optionSelect.emit(option);
      } else {
        this.selectedOptions = this.selectedOptions.filter(opt => opt.value !== option.value);
        this.optionDeselect.emit(option);
      }
    } else {
      this.selectedOptions = [option];
      this.optionSelect.emit(option);
      this.expanded = false;
    }

    this.hasValue = this.selectedOptions.length > 0;
    this.updateValue();
  }

  removeOption(option: SelectOption, event?: Event): void {
    event?.stopPropagation();
    this.selectedOptions = this.selectedOptions.filter(opt => opt.value !== option.value);
    this.optionDeselect.emit(option);
    this.updateValue();
  }

  clearSelection(event: Event): void {
    event.stopPropagation();
    this.selectedOptions = [];
    this.hasValue = false;
    this.updateValue();
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedOptions.some(opt => opt.value === option.value);
  }

  private updateValue(): void {
    const value = this.multiple
      ? this.selectedOptions.map(opt => opt.value)
      : this.selectedOptions[0]?.value;
    this.onChange(value);
    this.onTouched();
  }

  private updateGroupedOptions(): void {
    const groups = new Map<string, SelectOption[]>();
    
    this.filteredOptions.forEach(option => {
      const group = option.group || '';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(option);
    });

    this.groupedOptions = Array.from(groups.entries()).map(([group, options]) => ({
      group,
      options
    }));
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    if (this.multiple) {
      this.selectedOptions = this.options.filter(opt => 
        Array.isArray(value) && value.includes(opt.value)
      );
    } else {
      this.selectedOptions = this.options.filter(opt => opt.value === value);
    }
    this.hasValue = this.selectedOptions.length > 0;
    this.updateGroupedOptions();
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