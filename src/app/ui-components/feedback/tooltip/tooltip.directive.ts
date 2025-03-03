import { Directive, ElementRef, Input, ComponentRef, ViewContainerRef, OnDestroy, HostListener } from '@angular/core';
import { TooltipComponent, TooltipPosition, TooltipTheme } from './tooltip.component';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') content = '';
  @Input('appTooltipPosition') position: TooltipPosition = 'top';
  @Input('appTooltipTheme') theme: TooltipTheme = 'dark';
  @Input('appTooltipShowDelay') showDelay = 0;
  @Input('appTooltipHideDelay') hideDelay = 0;
  @Input('appTooltipMaxWidth') maxWidth = 200;
  @Input('appTooltipInteractive') interactive = false;

  private tooltipRef?: ComponentRef<TooltipComponent>;

  constructor(
    private elementRef: ElementRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (!this.tooltipRef) {
      this.show();
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.tooltipRef) {
      this.hide();
    }
  }

  private show(): void {
    this.tooltipRef = this.viewContainerRef.createComponent(TooltipComponent);
    const tooltip = this.tooltipRef.instance;

    tooltip.content = this.content;
    tooltip.position = this.position;
    tooltip.theme = this.theme;
    tooltip.showDelay = this.showDelay;
    tooltip.hideDelay = this.hideDelay;
    tooltip.maxWidth = this.maxWidth;
    tooltip.interactive = this.interactive;

    // Position the tooltip relative to the host element
    const element = this.tooltipRef.location.nativeElement;
    element.style.position = 'absolute';
    document.body.appendChild(element);

    this.updateTooltipPosition();
  }

  private hide(): void {
    if (this.tooltipRef) {
      this.tooltipRef.destroy();
      this.tooltipRef = undefined;
    }
  }

  private updateTooltipPosition(): void {
    if (!this.tooltipRef) return;

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipRef.location.nativeElement.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.position) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = hostRect.bottom + 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + 8;
        break;
    }

    const element = this.tooltipRef.location.nativeElement;
    element.style.top = `${top + window.scrollY}px`;
    element.style.left = `${left + window.scrollX}px`;
  }

  ngOnDestroy(): void {
    this.hide();
  }
} 