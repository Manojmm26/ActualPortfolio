import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputSwitchComponent } from './input-switch.component';

@NgModule({
  imports: [CommonModule, InputSwitchComponent],
  exports: [InputSwitchComponent]
})
export class InputSwitchModule { } 