import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DniIdentificationPage } from './dni-identification.page';

const routes: Routes = [
  {
    path: '',
    component: DniIdentificationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DniIdentificationPageRoutingModule {}
