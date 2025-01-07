import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DniManualsearchPageRoutingModule } from './dni-manualsearch-routing.module';

import { DniManualsearchPage } from './dni-manualsearch.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DniManualsearchPageRoutingModule
  ],
  declarations: [DniManualsearchPage]
})
export class DniManualsearchPageModule {}
