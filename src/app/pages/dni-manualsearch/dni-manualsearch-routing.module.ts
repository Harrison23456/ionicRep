import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DniManualsearchPage } from './dni-manualsearch.page';

const routes: Routes = [
  {
    path: '',
    component: DniManualsearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DniManualsearchPageRoutingModule {}
