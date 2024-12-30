import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DniIdentificationPageRoutingModule } from './dni-identification-routing.module';

import { DniIdentificationPage } from './dni-identification.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DniIdentificationPageRoutingModule
  ],
  declarations: [DniIdentificationPage]
})
export class DniIdentificationPageModule {}
