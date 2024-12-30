import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DniDetailsPageRoutingModule } from './dni-details-routing.module';

import { DniDetailsPage } from './dni-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DniDetailsPageRoutingModule
  ],
  declarations: [DniDetailsPage]
})
export class DniDetailsPageModule {}
