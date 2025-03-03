import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KnobComponent } from './knob.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    KnobComponent
  ],
  exports: [KnobComponent]
})
export class KnobModule { } 