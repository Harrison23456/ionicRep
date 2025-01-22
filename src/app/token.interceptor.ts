import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class tokenInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token JWT desde el almacenamiento local (localStorage o cualquier servicio)
    const token = localStorage.getItem('token'); // Cambia esto si usas otra forma de almacenar el token

    // Si hay un token, clonamos la solicitud y agregamos el encabezado Authorization
    if (token) {
      const clonedReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      return next.handle(clonedReq);
    }

    // Si no hay token, continuamos con la solicitud original
    return next.handle(req);
  }
}
