import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AuthService } from './services/auth.service';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { LoginPage } from './pages/login/login.page';
import { sSLInterceptorInterceptor } from './sslinterceptor.interceptor';
import { tokenInterceptor } from './token.interceptor';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [AuthService, Device, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: sSLInterceptorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: tokenInterceptor,
      multi: true // Asegura que puedas tener múltiples interceptores
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
