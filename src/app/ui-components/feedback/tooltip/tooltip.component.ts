import { Component, Input, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTheme = 'dark' | 'light' | 'primary' | 'custom';

@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tooltip-container">
      <div class="tooltip-trigger" (mouseenter)="show()" (mouseleave)="hide()">
        <ng-content></ng-content>
      </div>
      <div
        *ngIf="visible"
        class="tooltip"
        [class.top]="position === 'top'"
        [class.bottom]="position === 'bottom'"
        [class.left]="position === 'left'"
        [class.right]="position === 'right'"
        [class.dark]="theme === 'dark'"
        [class.light]="theme === 'light'"
        [class.primary]="theme === 'primary'"
        [style.background-color]="backgroundColor"
        [style.color]="textColor"
        [style.max-width.px]="maxWidth"
      >
        {{ content }}
        <div class="tooltip-arrow"></div>
      </div>
    </div>
  `,
  styles: [`
    .tooltip-container {
      position: relative;
      display: inline-block;
    }

    .tooltip {
      position: absolute;
      padding: 8px 12px;
      border-radius: var(--border-radius);
      font-size: 14px;
      line-height: 1.4;
      z-index: 1000;
      white-space: normal;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .tooltip.dark {
      background: var(--color-text);
      color: white;
    }

    .tooltip.light {
      background: white;
      color: var(--color-text);
      border: 1px solid var(--color-border);
    }

    .tooltip.primary {
      background: var(--color-primary);
      color: white;
    }

    .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    }

    /* Position styles remain the same */
    .tooltip.top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(-8px);
    }

    .tooltip.top .tooltip-arrow {
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 4px 4px 0 4px;
      border-color: currentColor transparent transparent transparent;
    }

    .tooltip.bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
    }

    .tooltip.bottom .tooltip-arrow {
      top: -4px;
      left: 50%;
      transform: translateX(-50%);
      border-width: 0 4px 4px 4px;
      border-color: transparent transparent currentColor transparent;
    }

    .tooltip.left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%) translateX(-8px);
    }

    .tooltip.left .tooltip-arrow {
      right: -4px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 4px 0 4px 4px;
      border-color: transparent transparent transparent currentColor;
    }

    .tooltip.right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%) translateX(8px);
    }

    .tooltip.right .tooltip-arrow {
      left: -4px;
      top: 50%;
      transform: translateY(-50%);
      border-width: 4px 4px 4px 0;
      border-color: transparent currentColor transparent transparent;
    }
  `]
})
export class TooltipComponent {
  @Input() content = '';
  @Input() position: TooltipPosition = 'top';
  @Input() theme: TooltipTheme = 'dark';
  @Input() backgroundColor = '';
  @Input() textColor = '';
  @Input() showDelay = 0;
  @Input() hideDelay = 0;
  @Input() maxWidth = 200;
  @Input() interactive = false;

  visible = false;
  private showTimeout?: number;
  private hideTimeout?: number;

  constructor(private elementRef: ElementRef) {}

  show(): void {
    clearTimeout(this.hideTimeout);
    this.showTimeout = window.setTimeout(() => {
      this.visible = true;
      this.updatePosition();
    }, this.showDelay);
  }

  hide(): void {
    if (!this.interactive) {
      clearTimeout(this.showTimeout);
      this.hideTimeout = window.setTimeout(() => {
        this.visible = false;
      }, this.hideDelay);
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.visible) {
      this.updatePosition();
    }
  }

  private updatePosition(): void {
    const element = this.elementRef.nativeElement;
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Adjust position based on viewport boundaries
    if (this.position === 'top' && rect.top < 40) {
      this.position = 'bottom';
    } else if (this.position === 'bottom' && rect.bottom > viewportHeight - 40) {
      this.position = 'top';
    } else if (this.position === 'left' && rect.left < 40) {
      this.position = 'right';
    } else if (this.position === 'right' && rect.right > viewportWidth - 40) {
      this.position = 'left';
    }
  }
} 