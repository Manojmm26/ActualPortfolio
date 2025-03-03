import { Component, Input, Output, EventEmitter, forwardRef, ContentChild, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface ListboxOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
  [key: string]: any;
}

@Component({
  selector: 'ui-listbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-listbox" [class.focused]="focused">
      <label *ngIf="label" class="listbox-label" [class.required]="required">
        {{ label }}
      </label>

      <div class="listbox-container" [class.disabled]="disabled">
        <!-- Search Input -->
        <div *ngIf="filter" class="search-container">
          <input
            type="text"
            class="search-input"
            [(ngModel)]="filterValue"
            (input)="onFilterChange($event)"
            [placeholder]="filterPlaceholder"
            [attr.aria-label]="filterPlaceholder">
        </div>

        <!-- Options List -->
        <div class="options-container" role="listbox" [attr.aria-multiselectable]="multiple">
          <ng-container *ngFor="let group of groupedOptions">
            <!-- Group Header -->
            <div *ngIf="group.name" class="option-group">
              {{ group.name }}
            </div>

            <!-- Options -->
            <div *ngFor="let option of group.options"
                 class="option"
                 role="option"
                 [class.selected]="isSelected(option)"
                 [class.disabled]="option.disabled"
                 [class.focused]="option === focusedOption"
                 [attr.aria-selected]="isSelected(option)"
                 [attr.aria-disabled]="option.disabled"
                 (click)="onOptionClick(option)"
                 (keydown)="onOptionKeyDown($event, option)">
              
              <!-- Selection Indicator -->
              <div class="selection-indicator" *ngIf="multiple">
                <input type="checkbox"
                       [checked]="isSelected(option)"
                       [disabled]="option.disabled"
                       (click)="$event.stopPropagation()">
              </div>

              <!-- Option Content -->
              <div class="option-content">
                <ng-container *ngTemplateOutlet="
                  optionTemplate || defaultOptionTemplate;
                  context: { $implicit: option }
                "></ng-container>
              </div>
            </div>
          </ng-container>

          <!-- Empty State -->
          <div *ngIf="!groupedOptions.length" class="empty-state">
            {{ noOptionsText }}
          </div>
        </div>
      </div>

      <!-- Hint/Error Messages -->
      <div *ngIf="hint" class="listbox-hint">{{ hint }}</div>
      <div *ngIf="error" class="listbox-error">{{ error }}</div>
    </div>

    <!-- Default Option Template -->
    <ng-template #defaultOptionTemplate let-option>
      {{ option.label }}
    </ng-template>
  `,
  styleUrls: ['./listbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ListboxComponent),
      multi: true
    }
  ]
})
export class ListboxComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() multiple = false;
  @Input() filter = false;
  @Input() filterPlaceholder = 'Search...';
  @Input() noOptionsText = 'No options available';
  @Input() options: ListboxOption[] = [];

  @Output() optionSelect = new EventEmitter<ListboxOption>();
  @Output() optionUnselect = new EventEmitter<ListboxOption>();
  @Output() filterChange = new EventEmitter<string>();

  @ContentChild('optionTemplate') optionTemplate?: TemplateRef<any>;
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  focused = false;
  filterValue = '';
  focusedOption: ListboxOption | null = null;
  selectedOptions: ListboxOption[] = [];
  groupedOptions: { name: string; options: ListboxOption[] }[] = [];

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit() {
    this.updateGroupedOptions();
  }

  onOptionClick(option: ListboxOption) {
    if (option.disabled) return;
    
    if (this.multiple) {
      this.toggleOption(option);
    } else {
      this.selectOption(option);
    }
  }

  onOptionKeyDown(event: KeyboardEvent, option: ListboxOption) {
    switch (event.key) {
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.onOptionClick(option);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextOption();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousOption();
        break;
    }
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.filterOptions(value);
    this.filterChange.emit(value);
  }

  private filterOptions(value: string) {
    const filtered = this.options.filter(option =>
      option.label.toLowerCase().includes(value.toLowerCase())
    );
    this.updateGroupedOptions(filtered);
  }

  private toggleOption(option: ListboxOption) {
    const index = this.selectedOptions.findIndex(o => o.value === option.value);
    if (index === -1) {
      this.selectedOptions = [...this.selectedOptions, option];
      this.optionSelect.emit(option);
    } else {
      this.selectedOptions = this.selectedOptions.filter(o => o.value !== option.value);
      this.optionUnselect.emit(option);
    }
    this.updateValue();
  }

  private selectOption(option: ListboxOption) {
    this.selectedOptions = [option];
    this.optionSelect.emit(option);
    this.updateValue();
  }

  private updateValue() {
    const value = this.multiple
      ? this.selectedOptions.map(o => o.value)
      : this.selectedOptions[0]?.value;
    this.onChange(value);
  }

  private updateGroupedOptions(options = this.options) {
    const groups = new Map<string, ListboxOption[]>();
    
    options.forEach(option => {
      const group = option.group || '';
      if (!groups.has(group)) {
        groups.set(group, []);
      }
      groups.get(group)!.push(option);
    });

    this.groupedOptions = Array.from(groups.entries()).map(([name, options]) => ({
      name: name || '',
      options
    }));
  }

  private focusNextOption() {
    const options = this.options.filter(o => !o.disabled);
    if (!options.length) return;

    const currentIndex = this.focusedOption
      ? options.indexOf(this.focusedOption)
      : -1;
    
    this.focusedOption = options[currentIndex + 1] || options[0];
  }

  private focusPreviousOption() {
    const options = this.options.filter(o => !o.disabled);
    if (!options.length) return;

    const currentIndex = this.focusedOption
      ? options.indexOf(this.focusedOption)
      : 0;
    
    this.focusedOption = options[currentIndex - 1] || options[options.length - 1];
  }

  isSelected(option: ListboxOption): boolean {
    return this.selectedOptions.some(o => o.value === option.value);
  }

  // ControlValueAccessor Implementation
  writeValue(value: any): void {
    if (this.multiple && Array.isArray(value)) {
      this.selectedOptions = this.options.filter(o =>
        value.includes(o.value)
      );
    } else if (value !== undefined && value !== null) {
      const option = this.options.find(o => o.value === value);
      this.selectedOptions = option ? [option] : [];
    } else {
      this.selectedOptions = [];
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