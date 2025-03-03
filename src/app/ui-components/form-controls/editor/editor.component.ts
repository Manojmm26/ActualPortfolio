import { Component, Input, Output, EventEmitter, forwardRef, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../base/base.component';

export interface EditorToolbarConfig {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  alignLeft?: boolean;
  alignCenter?: boolean;
  alignRight?: boolean;
  alignJustify?: boolean;
  orderedList?: boolean;
  unorderedList?: boolean;
  indent?: boolean;
  outdent?: boolean;
  link?: boolean;
  image?: boolean;
  color?: boolean;
  background?: boolean;
  clear?: boolean;
  undo?: boolean;
  redo?: boolean;
  formats?: boolean;
}

@Component({
  selector: 'ui-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="ui-editor" [class.focused]="focused">
      <!-- Label -->
      <label *ngIf="label" class="editor-label" [class.required]="required">
        {{ label }}
      </label>

      <!-- Toolbar -->
      <div class="editor-toolbar" role="toolbar" aria-label="Text editor toolbar">
        <!-- Text Style -->
        <div class="toolbar-group" *ngIf="toolbar.formats">
          <select 
            class="format-select"
            (change)="execCommand('formatBlock', $event)"
            [attr.aria-label]="'Text format'">
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
            <option value="h5">Heading 5</option>
            <option value="h6">Heading 6</option>
            <option value="pre">Preformatted</option>
          </select>
        </div>

        <!-- Text Formatting -->
        <div class="toolbar-group">
          <button *ngIf="toolbar.bold"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('bold')"
                  (click)="execCommand('bold')"
                  aria-label="Bold">
            <i class="fas fa-bold"></i>
          </button>
          <button *ngIf="toolbar.italic"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('italic')"
                  (click)="execCommand('italic')"
                  aria-label="Italic">
            <i class="fas fa-italic"></i>
          </button>
          <button *ngIf="toolbar.underline"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('underline')"
                  (click)="execCommand('underline')"
                  aria-label="Underline">
            <i class="fas fa-underline"></i>
          </button>
          <button *ngIf="toolbar.strikethrough"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('strikethrough')"
                  (click)="execCommand('strikethrough')"
                  aria-label="Strikethrough">
            <i class="fas fa-strikethrough"></i>
          </button>
        </div>

        <!-- Text Alignment -->
        <div class="toolbar-group">
          <button *ngIf="toolbar.alignLeft"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('justifyLeft')"
                  (click)="execCommand('justifyLeft')"
                  aria-label="Align left">
            <i class="fas fa-align-left"></i>
          </button>
          <button *ngIf="toolbar.alignCenter"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('justifyCenter')"
                  (click)="execCommand('justifyCenter')"
                  aria-label="Align center">
            <i class="fas fa-align-center"></i>
          </button>
          <button *ngIf="toolbar.alignRight"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('justifyRight')"
                  (click)="execCommand('justifyRight')"
                  aria-label="Align right">
            <i class="fas fa-align-right"></i>
          </button>
          <button *ngIf="toolbar.alignJustify"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('justifyFull')"
                  (click)="execCommand('justifyFull')"
                  aria-label="Justify">
            <i class="fas fa-align-justify"></i>
          </button>
        </div>

        <!-- Lists -->
        <div class="toolbar-group">
          <button *ngIf="toolbar.orderedList"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('insertOrderedList')"
                  (click)="execCommand('insertOrderedList')"
                  aria-label="Ordered list">
            <i class="fas fa-list-ol"></i>
          </button>
          <button *ngIf="toolbar.unorderedList"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('insertUnorderedList')"
                  (click)="execCommand('insertUnorderedList')"
                  aria-label="Unordered list">
            <i class="fas fa-list-ul"></i>
          </button>
          <button *ngIf="toolbar.indent"
                  type="button"
                  class="toolbar-button"
                  (click)="execCommand('indent')"
                  aria-label="Indent">
            <i class="fas fa-indent"></i>
          </button>
          <button *ngIf="toolbar.outdent"
                  type="button"
                  class="toolbar-button"
                  (click)="execCommand('outdent')"
                  aria-label="Outdent">
            <i class="fas fa-outdent"></i>
          </button>
        </div>

        <!-- Insert -->
        <div class="toolbar-group">
          <button *ngIf="toolbar.link"
                  type="button"
                  class="toolbar-button"
                  [class.active]="isActive('createLink')"
                  (click)="insertLink()"
                  aria-label="Insert link">
            <i class="fas fa-link"></i>
          </button>
          <button *ngIf="toolbar.image"
                  type="button"
                  class="toolbar-button"
                  (click)="insertImage()"
                  aria-label="Insert image">
            <i class="fas fa-image"></i>
          </button>
        </div>

        <!-- Colors -->
        <div class="toolbar-group">
          <input *ngIf="toolbar.color"
                 type="color"
                 class="color-picker"
                 (change)="execCommand('foreColor', $event)"
                 aria-label="Text color">
          <input *ngIf="toolbar.background"
                 type="color"
                 class="color-picker"
                 (change)="execCommand('hiliteColor', $event)"
                 aria-label="Background color">
        </div>

        <!-- Actions -->
        <div class="toolbar-group">
          <button *ngIf="toolbar.undo"
                  type="button"
                  class="toolbar-button"
                  (click)="execCommand('undo')"
                  aria-label="Undo">
            <i class="fas fa-undo"></i>
          </button>
          <button *ngIf="toolbar.redo"
                  type="button"
                  class="toolbar-button"
                  (click)="execCommand('redo')"
                  aria-label="Redo">
            <i class="fas fa-redo"></i>
          </button>
          <button *ngIf="toolbar.clear"
                  type="button"
                  class="toolbar-button"
                  (click)="clearFormat()"
                  aria-label="Clear formatting">
            <i class="fas fa-remove-format"></i>
          </button>
        </div>
      </div>

      <!-- Editor Content -->
      <div #editor
           class="editor-content"
           [attr.contenteditable]="!disabled"
           [attr.aria-label]="label || 'Rich text editor'"
           [attr.aria-required]="required"
           [attr.aria-disabled]="disabled"
           (input)="onInput($event)"
           (blur)="onBlur()"
           (focus)="onFocus()"
           role="textbox"
           aria-multiline="true">
      </div>

      <!-- Hint & Error -->
      <div *ngIf="hint" class="editor-hint">{{ hint }}</div>
      <div *ngIf="error" class="editor-error">{{ error }}</div>
    </div>
  `,
  styleUrls: ['./editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true
    }
  ]
})
export class EditorComponent extends BaseComponent implements ControlValueAccessor, AfterViewInit {
  @Input() label = '';
  @Input() hint = '';
  @Input() error = '';
  @Input() required = false;
  @Input() minHeight = 200;
  @Input() maxHeight?: number;
  @Input() sanitize = true;
  @Input() toolbar: EditorToolbarConfig = {
    bold: true,
    italic: true,
    underline: true,
    strikethrough: true,
    subscript: true,
    superscript: true,
    alignLeft: true,
    alignCenter: true,
    alignRight: true,
    alignJustify: true,
    orderedList: true,
    unorderedList: true,
    indent: true,
    outdent: true,
    link: true,
    image: true,
    color: true,
    background: true,
    clear: true,
    undo: true,
    redo: true,
    formats: true
  };

  @Output() textChange = new EventEmitter<string>();
  @Output() selectionChange = new EventEmitter<Selection>();

  @ViewChild('editor') editorElement!: ElementRef<HTMLDivElement>;

  value = '';
  focused = false;

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  ngAfterViewInit(): void {
    this.setupEditor();
  }

  private setupEditor(): void {
    const editor = this.editorElement.nativeElement;
    editor.style.minHeight = `${this.minHeight}px`;
    if (this.maxHeight) {
      editor.style.maxHeight = `${this.maxHeight}px`;
    }
  }

  onInput(event: Event): void {
    const content = (event.target as HTMLDivElement).innerHTML;
    this.value = this.sanitize ? this.sanitizeHtml(content) : content;
    this.onChange(this.value);
    this.textChange.emit(this.value);
  }

  onFocus(): void {
    this.focused = true;
  }

  onBlur(): void {
    this.focused = false;
    this.onTouched();
  }

  execCommand(command: string, event?: Event): void {
    if (event) {
      const value = (event.target as HTMLSelectElement | HTMLInputElement).value;
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false);
    }
    this.emitChange();
  }

  isActive(command: string): boolean {
    return document.queryCommandState(command);
  }

  insertLink(): void {
    const url = prompt('Enter URL:');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  }

  insertImage(): void {
    const url = prompt('Enter image URL:');
    if (url) {
      document.execCommand('insertImage', false, url);
    }
  }

  clearFormat(): void {
    document.execCommand('removeFormat', false);
  }

  private sanitizeHtml(html: string): string {
    // Basic HTML sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/g, '');
  }

  // ControlValueAccessor Implementation
  writeValue(value: string): void {
    this.value = value || '';
    if (this.editorElement) {
      this.editorElement.nativeElement.innerHTML = this.value;
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
    if (this.editorElement) {
      this.editorElement.nativeElement.contentEditable = (!isDisabled).toString();
    }
  }

  private createCustomEvent(): Event {
    const event = new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: this.editorElement.nativeElement
    });
    return event;
  }

  private emitChange(): void {
    this.onInput(this.createCustomEvent());
  }
} 