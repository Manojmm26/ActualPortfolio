import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputCheckboxComponent } from './input-checkbox.component';

@NgModule({
  imports: [CommonModule, InputCheckboxComponent],
  exports: [InputCheckboxComponent]
})
export class InputCheckboxModule { } 