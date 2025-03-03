import { Component, Input, Output, EventEmitter, forwardRef, ContentChild, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';

export interface CascadeOption {
  label: string;
  value: any;
  children?: CascadeOption[];
  [key: string]: any;
}

export interface CascadeLevel {
  options: CascadeOption[];
  selectedOption: CascadeOption | null;
  loading?: boolean;
}

@Component({
  selector: 'ui-cascade-select',
  templateUrl: './cascade-select.component.html',
  styleUrls: ['./cascade-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CascadeSelectComponent),
      multi: true
    }
  ]
})
export class CascadeSelectComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() override disabled = false;
  @Input() required = false;
  @Input() options: CascadeOption[] = [];
  @Input() loadingText = 'Loading...';
  @Input() noOptionsText = 'No options available';
  @Input() clearable = true;
  @Input() showPath = true;

  @Input() set asyncChildOptions(value: ((option: CascadeOption) => Promise<CascadeOption[]>) | null) {
    this._asyncChildOptions = value;
    this.initializeLevels();
  }
  get asyncChildOptions(): ((option: CascadeOption) => Promise<CascadeOption[]>) | null {
    return this._asyncChildOptions;
  }

  @Output() levelChange = new EventEmitter<number>();
  @Output() optionSelect = new EventEmitter<CascadeOption>();
  @Output() clear = new EventEmitter<void>();

  @ContentChild('optionTemplate') optionTemplate?: TemplateRef<any>;
  @ContentChild('selectedPathTemplate') selectedPathTemplate?: TemplateRef<any>;

  id = `ui-cascade-select-${Math.random().toString(36).substr(2, 9)}`;
  expanded = false;
  focused = false;
  levels: CascadeLevel[] = [];
  selectedPath: CascadeOption[] = [];

  private _asyncChildOptions: ((option: CascadeOption) => Promise<CascadeOption[]>) | null = null;
  private onChange: (value: any) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnInit() {
    this.initializeLevels();
  }

  private initializeLevels() {
    this.levels = [{
      options: this.options,
      selectedOption: null
    }];
  }

  async onOptionSelect(option: CascadeOption, levelIndex: number) {
    // Update the selected option for the current level
    this.levels[levelIndex].selectedOption = option;
    
    // Trim levels after the current selection
    this.levels = this.levels.slice(0, levelIndex + 1);
    
    // Update selected path
    this.selectedPath = this.levels
      .map(level => level.selectedOption)
      .filter((opt): opt is CascadeOption => opt !== null);

    // Load next level if children exist or can be loaded
    if (this.asyncChildOptions) {
      this.levels.push({ options: [], selectedOption: null, loading: true });
      try {
        const children = await this.asyncChildOptions(option);
        this.levels[levelIndex + 1] = {
          options: children,
          selectedOption: null,
          loading: false
        };
      } catch (error) {
        this.levels.pop(); // Remove loading level on error
        console.error('Error loading cascade options:', error);
      }
    } else if (option.children?.length) {
      this.levels.push({
        options: option.children,
        selectedOption: null
      });
    }

    // Emit events and update value
    this.levelChange.emit(this.levels.length);
    this.optionSelect.emit(option);
    this.updateValue();
  }

  private updateValue() {
    const lastSelected = this.selectedPath[this.selectedPath.length - 1];
    this.onChange(lastSelected?.value || null);
  }

  getDisplayValue(): string {
    if (!this.selectedPath.length) {
      return '';
    }
    return this.showPath
      ? this.selectedPath.map(opt => opt.label).join(' > ')
      : this.selectedPath[this.selectedPath.length - 1].label;
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

  clearSelection() {
    this.levels = [{
      options: this.options,
      selectedOption: null
    }];
    this.selectedPath = [];
    this.onChange(null);
    this.clear.emit();
  }

  trackByValue(_: number, option: CascadeOption): any {
    return option.value;
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    // Reset selection
    this.initializeLevels();
    this.selectedPath = [];

    if (value === null || value === undefined) {
      return;
    }

    // Try to find and select the path to the value
    const findPath = (options: CascadeOption[], targetValue: any): CascadeOption[] | null => {
      for (const option of options) {
        if (option.value === targetValue) {
          return [option];
        }
        if (option.children) {
          const childPath = findPath(option.children, targetValue);
          if (childPath) {
            return [option, ...childPath];
          }
        }
      }
      return null;
    };

    const path = findPath(this.options, value);
    if (path) {
      path.forEach((option, index) => {
        this.levels[index] = {
          options: index === 0 ? this.options : this.levels[index - 1].selectedOption!.children!,
          selectedOption: option
        };
      });
      this.selectedPath = path;
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