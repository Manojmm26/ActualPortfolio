import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CascadeSelectComponent } from './cascade-select.component';

@NgModule({
  declarations: [CascadeSelectComponent],
  imports: [CommonModule],
  exports: [CascadeSelectComponent]
})
export class CascadeSelectModule { } 