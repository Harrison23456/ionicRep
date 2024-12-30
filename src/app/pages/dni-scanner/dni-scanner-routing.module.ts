import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DniScannerPage } from './dni-scanner.page';

const routes: Routes = [
  {
    path: '',
    component: DniScannerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DniScannerPageRoutingModule {}
