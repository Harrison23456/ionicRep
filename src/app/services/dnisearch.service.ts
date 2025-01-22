import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DnisearchService {
  private API_URL = 'https://192.168.30.21:3000/api/mobileroute/dni';

  constructor(private http: HttpClient) {}

  getDniData(dni: string) {
    return this.http.get(`${this.API_URL}/${dni}`).pipe(
      catchError((error) => {
        // Tipamos error como any para manejar casos desconocidos
        const errorMessage =
          error.error?.message ||
          error.statusText ||
          'Error desconocido al consultar el servicio';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  guardarConsulta(datos: any): Observable<any> {
    return this.http.post(`${this.API_URL}/registrarconsulta`, datos);
  }
}
