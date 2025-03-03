import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface Tag {
  label: string;
  value: any;
  [key: string]: any;
}

@Component({
  selector: 'ui-tags',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-tags" [class.focused]="focused">
      <label *ngIf="label" [for]="id" class="tags-label" [class.required]="required">
        {{ label }}
      </label>

      <div class="tags-container"
           [class.disabled]="disabled"
           [class.has-error]="!!error"
           (click)="focusInput()">
        <div class="tags-wrapper">
          <!-- Selected Tags -->
          <div *ngFor="let tag of selectedTags; let i = index" 
               class="tag"
               [class.disabled]="disabled">
            <span class="tag-label">{{ tag.label }}</span>
            <button type="button"
                    class="remove-tag"
                    (click)="removeTag(i)"
                    [disabled]="disabled"
                    [attr.aria-label]="'Remove ' + tag.label">
              ×
            </button>
          </div>

          <!-- Input Field -->
          <input #tagInput
                 [id]="id"
                 type="text"
                 [placeholder]="getPlaceholder()"
                 [disabled]="disabled || (maxTags !== null && selectedTags.length >= maxTags)"
                 [(ngModel)]="inputValue"
                 (input)="onInput($event)"
                 (keydown)="onKeyDown($event)"
                 (focus)="onFocus()"
                 (blur)="onBlur()"
                 [attr.aria-label]="label || 'Tag input'"
                 [attr.aria-describedby]="getAriaDescribedBy()"
                 class="tag-input"
          />
        </div>

        <!-- Suggestions Dropdown -->
        <div *ngIf="showSuggestions && filteredSuggestions.length > 0"
             class="suggestions-dropdown"
             role="listbox"
             [attr.aria-label]="'Tag suggestions'">
          <div *ngFor="let suggestion of filteredSuggestions; let i = index"
               class="suggestion-item"
               [class.active]="i === activeSuggestionIndex"
               (mousedown)="selectSuggestion(suggestion)"
               (mouseover)="activeSuggestionIndex = i"
               role="option"
               [attr.aria-selected]="i === activeSuggestionIndex">
            {{ suggestion.label }}
          </div>
        </div>
      </div>

      <!-- Hint and Error Messages -->
      <div *ngIf="hint && !error" class="tags-hint" [id]="id + '-hint'">
        {{ hint }}
      </div>
      <div *ngIf="error" class="tags-error" [id]="id + '-error'">
        {{ error }}
      </div>
    </div>
  `,
  styleUrls: ['./input-tags.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTagsComponent),
      multi: true
    }
  ]
})
export class InputTagsComponent extends BaseComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() placeholder = 'Add tags...';
  @Input() maxTags: number | null = null;
  @Input() minTags = 0;
  @Input() suggestions: Tag[] = [];
  @Input() allowCustomTags = true;
  @Input() addOnBlur = true;
  @Input() addOnPaste = true;
  @Input() pasteSeparator = ',';
  @Input() duplicateCheck: 'value' | 'label' = 'value';
  @Input() override theme: 'primary' | 'secondary' | 'success' | 'error' = 'primary';
  @Input() override size: 'sm' | 'md' | 'lg' = 'md';

  @Output() add = new EventEmitter<Tag>();
  @Output() remove = new EventEmitter<Tag>();
  @Output() change = new EventEmitter<Tag[]>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();
  @Output() invalid = new EventEmitter<string>();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  selectedTags: Tag[] = [];
  inputValue = '';
  focused = false;
  showSuggestions = false;
  filteredSuggestions: Tag[] = [];
  activeSuggestionIndex = -1;
  id = 'ui-tags-' + Math.random().toString(36).substring(2);

  protected onTouched: () => void = () => {};
  private onChange: (value: Tag[]) => void = () => {};

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.inputValue = input.value;
    this.filterSuggestions();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (this.activeSuggestionIndex >= 0) {
          this.selectSuggestion(this.filteredSuggestions[this.activeSuggestionIndex]);
        } else if (this.inputValue.trim()) {
          this.addTag(this.inputValue.trim());
        }
        break;

      case 'Backspace':
        if (!this.inputValue && this.selectedTags.length > 0) {
          this.removeTag(this.selectedTags.length - 1);
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (this.showSuggestions && this.filteredSuggestions.length > 0) {
          this.activeSuggestionIndex = Math.min(
            this.activeSuggestionIndex + 1,
            this.filteredSuggestions.length - 1
          );
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.showSuggestions && this.filteredSuggestions.length > 0) {
          this.activeSuggestionIndex = Math.max(this.activeSuggestionIndex - 1, -1);
        }
        break;

      case 'Escape':
        this.showSuggestions = false;
        this.activeSuggestionIndex = -1;
        break;
    }
  }

  onFocus(): void {
    this.focused = true;
    this.showSuggestions = true;
    this.filterSuggestions();
    this.focus.emit();
  }

  onBlur(): void {
    setTimeout(() => {
      this.focused = false;
      this.showSuggestions = false;
      this.activeSuggestionIndex = -1;
      
      if (this.addOnBlur && this.inputValue.trim()) {
        this.addTag(this.inputValue.trim());
      }
      
      this.onTouched();
      this.blur.emit();
    }, 200);
  }

  focusInput(): void {
    if (!this.disabled) {
      this.tagInput.nativeElement.focus();
    }
  }

  addTag(label: string): void {
    if (this.maxTags !== null && this.selectedTags.length >= this.maxTags) {
      this.invalid.emit('Maximum tags limit reached');
      return;
    }

    if (!this.allowCustomTags && !this.suggestions.some(s => s.label === label)) {
      this.invalid.emit('Custom tags are not allowed');
      return;
    }

    const existingTag = this.selectedTags.find(tag => 
      this.duplicateCheck === 'label' ? tag.label === label : tag.value === label
    );

    if (existingTag) {
      this.invalid.emit('Duplicate tag');
      return;
    }

    const suggestion = this.suggestions.find(s => s.label === label);
    const newTag: Tag = suggestion || { label, value: label };
    
    this.selectedTags = [...this.selectedTags, newTag];
    this.inputValue = '';
    this.filterSuggestions();
    this.updateValue();
    this.add.emit(newTag);
  }

  removeTag(index: number): void {
    if (this.disabled) return;
    
    const removedTag = this.selectedTags[index];
    this.selectedTags = this.selectedTags.filter((_, i) => i !== index);
    this.updateValue();
    this.remove.emit(removedTag);
  }

  selectSuggestion(suggestion: Tag): void {
    this.addTag(suggestion.label);
    this.showSuggestions = false;
    this.activeSuggestionIndex = -1;
  }

  private filterSuggestions(): void {
    if (!this.suggestions.length) return;

    const query = this.inputValue.toLowerCase();
    this.filteredSuggestions = this.suggestions.filter(suggestion =>
      suggestion.label.toLowerCase().includes(query) &&
      !this.selectedTags.some(tag => 
        this.duplicateCheck === 'label' 
          ? tag.label === suggestion.label 
          : tag.value === suggestion.value
      )
    );
  }

  private updateValue(): void {
    this.onChange(this.selectedTags);
    this.change.emit(this.selectedTags);
  }

  getPlaceholder(): string {
    return this.selectedTags.length === 0 ? this.placeholder : '';
  }

  getAriaDescribedBy(): string | null {
    const ids: string[] = [];
    if (this.hint) ids.push(this.id + '-hint');
    if (this.error) ids.push(this.id + '-error');
    return ids.length ? ids.join(' ') : null;
  }

  // ControlValueAccessor implementation
  writeValue(value: Tag[]): void {
    this.selectedTags = value || [];
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