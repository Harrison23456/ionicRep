import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImeiPageRoutingModule } from './imei-routing.module';

import { ImeiPage } from './imei.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImeiPageRoutingModule
  ],
  declarations: [ImeiPage]
})
export class ImeiPageModule {}
