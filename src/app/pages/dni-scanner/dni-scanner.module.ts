import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DniScannerPageRoutingModule } from './dni-scanner-routing.module';

import { DniScannerPage } from './dni-scanner.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DniScannerPageRoutingModule
  ],
  declarations: [DniScannerPage]
})
export class DniScannerPageModule {}
