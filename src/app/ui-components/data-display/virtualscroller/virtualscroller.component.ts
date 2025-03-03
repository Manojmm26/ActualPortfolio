import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, TemplateRef, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from '../../base/base.component';

export interface ScrollerOptions {
  itemSize: number;
  minBufferPx?: number;
  maxBufferPx?: number;
  scrollThrottleTime?: number;
}

@Component({
  selector: 'app-virtual-scroller',
  template: `
    <div class="virtual-scroller" #container (scroll)="onScroll()">
      <div class="total-space" [style.height.px]="totalHeight"></div>
      <div class="viewport" [style.transform]="'translateY(' + topPadding + 'px)'">
        <div *ngFor="let item of visibleItems" class="item">
          <ng-container *ngTemplateOutlet="itemTemplate; context: { $implicit: item }">
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .virtual-scroller {
      height: 100%;
      overflow-y: auto;
      position: relative;
    }

    .total-space {
      width: 1px;
      visibility: hidden;
    }

    .viewport {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
    }

    .item {
      box-sizing: border-box;
    }
  `]
})
export class VirtualScrollerComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() itemHeight = 50;
  @Input() itemTemplate: any;
  @Input() bufferSize = 5;

  @Output() scrolledToBottom = new EventEmitter<void>();

  @ViewChild('container') containerRef!: ElementRef;

  visibleItems: any[] = [];
  topPadding = 0;
  totalHeight = 0;
  private scrollHandler: any;

  ngOnInit() {
    this.initializeScroller();
  }

  ngOnDestroy() {
    if (this.scrollHandler) {
      this.containerRef.nativeElement.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private initializeScroller() {
    this.totalHeight = this.items.length * this.itemHeight;
    this.updateVisibleItems();
  }

  onScroll() {
    this.updateVisibleItems();

    // Check if scrolled to bottom
    const container = this.containerRef.nativeElement;
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 50) {
      this.scrolledToBottom.emit();
    }
  }

  private updateVisibleItems() {
    if (!this.containerRef) return;

    const container = this.containerRef.nativeElement;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;

    // Calculate visible range
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / this.itemHeight) + this.bufferSize,
      this.items.length
    );

    // Update visible items and padding
    this.visibleItems = this.items.slice(
      Math.max(0, startIndex - this.bufferSize),
      endIndex
    );
    this.topPadding = Math.max(0, startIndex - this.bufferSize) * this.itemHeight;
  }

  scrollToIndex(index: number) {
    if (!this.containerRef) return;

    const container = this.containerRef.nativeElement;
    container.scrollTop = index * this.itemHeight;
  }

  refresh() {
    this.initializeScroller();
  }
} 