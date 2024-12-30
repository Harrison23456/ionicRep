import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/menu/menu.module').then( m => m.MenuPageModule)
    },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'dni-details', canActivate: [authGuard],
    loadChildren: () => import('./pages/dni-details/dni-details.module').then( m => m.DniDetailsPageModule)
  },
  {
    path: 'dni-scanner', 
    loadChildren: () => import('./pages/dni-scanner/dni-scanner.module').then( m => m.DniScannerPageModule)
  },
  {
    path: 'dni-identification',
    loadChildren: () => import('./pages/dni-identification/dni-identification.module').then( m => m.DniIdentificationPageModule)
  },
  {
    path: 'menu',
    loadChildren: () => import('./pages/menu/menu.module').then( m => m.MenuPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
