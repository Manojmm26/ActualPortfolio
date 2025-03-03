import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputTagsComponent } from './input-tags.component';

@NgModule({
  imports: [CommonModule, InputTagsComponent],
  exports: [InputTagsComponent]
})
export class InputTagsModule { } 