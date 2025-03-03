import { Component, Input, Output, EventEmitter, forwardRef, ContentChild, TemplateRef, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';
import { Subject, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

export interface AutoCompleteItem {
  label: string;
  value: any;
  [key: string]: any;
}

@Component({
  selector: 'ui-auto-complete',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutoCompleteComponent),
      multi: true
    }
  ]
})
export class AutoCompleteComponent extends BaseComponent implements ControlValueAccessor, OnDestroy {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() override disabled = false;
  @Input() required = false;
  @Input() multiple = false;
  @Input() minChars = 1;
  @Input() debounceTime = 300;
  @Input() suggestions: AutoCompleteItem[] = [];
  @Input() maxSuggestions = 10;
  @Input() loadingSuggestionText = 'Loading...';
  @Input() noSuggestionsText = 'No suggestions found';
  @Input() clearable = true;

  @Input() set suggestionLoader(value: ((query: string) => Observable<AutoCompleteItem[]>) | null) {
    this._suggestionLoader = value;
    this.setupSearchSubscription();
  }
  get suggestionLoader(): ((query: string) => Observable<AutoCompleteItem[]>) | null {
    return this._suggestionLoader;
  }

  @Output() suggestionSelect = new EventEmitter<AutoCompleteItem>();
  @Output() suggestionRemove = new EventEmitter<AutoCompleteItem>();
  @Output() clear = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();

  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;
  @ContentChild('itemTemplate') itemTemplate?: TemplateRef<any>;
  @ContentChild('selectedItemTemplate') selectedItemTemplate?: TemplateRef<any>;

  id = `ui-autocomplete-${Math.random().toString(36).substr(2, 9)}`;
  focused = false;
  loading = false;
  showSuggestions = false;
  highlightedIndex = -1;
  searchQuery = '';
  selectedItems: AutoCompleteItem[] = [];
  filteredSuggestions: AutoCompleteItem[] = [];

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  private _suggestionLoader: ((query: string) => Observable<AutoCompleteItem[]>) | null = null;

  private onChange: (value: any) => void = () => {};
  protected onTouched: () => void = () => {};

  ngOnDestroy() {
    this.searchSubscription?.unsubscribe();
  }

  private setupSearchSubscription() {
    this.searchSubscription?.unsubscribe();
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      tap(() => this.loading = true),
      switchMap(query => {
        if (query.length < this.minChars) {
          return of([]);
        }
        if (this.suggestionLoader) {
          return this.suggestionLoader(query);
        }
        return of(this.filterSuggestions(query));
      }),
      tap(() => this.loading = false)
    ).subscribe(suggestions => {
      this.filteredSuggestions = suggestions.slice(0, this.maxSuggestions);
      this.showSuggestions = true;
      this.highlightedIndex = -1;
    });
  }

  private filterSuggestions(query: string): AutoCompleteItem[] {
    const normalizedQuery = query.toLowerCase();
    return this.suggestions.filter(item =>
      item.label.toLowerCase().includes(normalizedQuery) &&
      !this.isItemSelected(item)
    );
  }

  onInput(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.search.emit(query);
    this.searchSubject.next(query);
  }

  onFocus() {
    this.focused = true;
    if (this.searchQuery.length >= this.minChars) {
      this.searchSubject.next(this.searchQuery);
    }
  }

  onBlur() {
    setTimeout(() => {
      this.focused = false;
      this.showSuggestions = false;
      this.onTouched();
    }, 200);
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredSuggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0) {
          this.selectItem(this.filteredSuggestions[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.showSuggestions = false;
        break;
      case 'Backspace':
        if (!this.searchQuery && this.multiple && this.selectedItems.length) {
          this.removeItem(this.selectedItems[this.selectedItems.length - 1]);
        }
        break;
    }
  }

  selectItem(item: AutoCompleteItem) {
    if (this.multiple) {
      if (!this.isItemSelected(item)) {
        this.selectedItems = [...this.selectedItems, item];
        this.onChange(this.selectedItems.map(i => i.value));
      }
    } else {
      this.selectedItems = [item];
      this.onChange(item.value);
    }

    this.suggestionSelect.emit(item);
    this.searchQuery = '';
    this.showSuggestions = false;
    this.inputElement.nativeElement.value = '';
    this.inputElement.nativeElement.focus();
  }

  removeItem(item: AutoCompleteItem) {
    this.selectedItems = this.selectedItems.filter(i => i.value !== item.value);
    this.onChange(this.multiple ? this.selectedItems.map(i => i.value) : null);
    this.suggestionRemove.emit(item);
  }

  clearSelection() {
    this.selectedItems = [];
    this.searchQuery = '';
    this.onChange(this.multiple ? [] : null);
    this.clear.emit();
    this.inputElement.nativeElement.value = '';
    this.inputElement.nativeElement.focus();
  }

  isItemSelected(item: AutoCompleteItem): boolean {
    return this.selectedItems.some(i => i.value === item.value);
  }

  trackByValue(_: number, item: AutoCompleteItem): any {
    return item.value;
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    if (this.multiple) {
      this.selectedItems = Array.isArray(value) 
        ? value
            .map(v => this.suggestions.find(s => s.value === v))
            .filter((item): item is AutoCompleteItem => item !== undefined)
        : [];
    } else {
      const item = this.suggestions.find(s => s.value === value);
      this.selectedItems = item ? [item] : [];
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