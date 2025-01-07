import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImeiPage } from './imei.page';

const routes: Routes = [
  {
    path: '',
    component: ImeiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImeiPageRoutingModule {}
