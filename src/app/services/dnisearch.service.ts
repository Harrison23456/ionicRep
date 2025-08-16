import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DnisearchService {
  private API_URL = 'https://44.201.220.104.nip.io/api/api/mobileroute/dni';
  private baseUrl = 'https://44.201.220.104.nip.io/api/api/sala';

  constructor(private http: HttpClient) {}

  getDniData(dni: string) {
    return this.http.get(`${this.API_URL}/${dni}`).pipe(
      catchError((error) => {
        // Tipamos error como any para manejar casos desconocidos
        console.error('Error al consultar la API:', error); // 👈 Imprime el error completo

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

  // Buscar si un DNI corresponde a un ludópata
  buscarLudopata(dni: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/sololudopata/${dni}`);
  }

  buscarAgravio(dni: string): Observable<any> {
    const token = localStorage.getItem('token');  // Asegúrate de que el token esté guardado en localStorage
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    return this.http.get<any>(`${this.baseUrl}/soloagravio/${dni}`, { headers });
  }
  
  buscarLudopataLocal(dni: string): Observable<any> {
  return this.http.get<any>(`${this.API_URL}/check-local-ludopata/${dni}`);
}


  enviarDatosDni(dniData: any) {
    return this.http.post(`${this.API_URL}/check-local-ludopata/`, { dniData });
  }
}

