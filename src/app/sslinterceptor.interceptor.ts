import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpInterceptorFn } from '@angular/common/http';

@Injectable()
export class sSLInterceptorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Permitir la conexión sin validar el SSL
    const cloneReq = req.clone({
      setHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // Ignorar las validaciones de certificado en desarrollo (no recomendado en producción)
      withCredentials: true
    });

    return next.handle(cloneReq);
  }
}
