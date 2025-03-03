import { Component, Input, HostBinding } from '@angular/core';

@Component({
  template: ''
})
export class BaseComponent {
  @Input() theme?: string;
  @Input() size?: 'sm' | 'md' | 'lg' | 'xl';
  @Input() disabled?: boolean;
  @Input() customClass?: string;

  @HostBinding('class') get hostClasses(): string {
    return [
      this.theme ? `ui-theme-${this.theme}` : '',
      this.size ? `ui-size-${this.size}` : '',
      this.disabled ? 'ui-disabled' : '',
      this.customClass || ''
    ].filter(Boolean).join(' ');
  }

  protected generateComponentId(): string {
    return `ui-${Math.random().toString(36).substr(2, 9)}`;
  }
} 