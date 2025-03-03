import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VirtualScrollerComponent } from './virtualscroller.component';

@NgModule({
  declarations: [VirtualScrollerComponent],
  imports: [CommonModule],
  exports: [VirtualScrollerComponent]
})
export class VirtualScrollerModule { } 