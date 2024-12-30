import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DniDetailsPage } from './dni-details.page';

const routes: Routes = [
  {
    path: '',
    component: DniDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DniDetailsPageRoutingModule {}
