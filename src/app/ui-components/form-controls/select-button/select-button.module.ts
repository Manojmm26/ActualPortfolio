import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectButtonComponent } from './select-button.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SelectButtonComponent
  ],
  exports: [
    SelectButtonComponent
  ]
})
export class SelectButtonModule { } 