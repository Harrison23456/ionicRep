import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://192.168.30.21:3000/api/mobileroute'; // URL base del backend

  constructor(private http: HttpClient) {}

  /**
   * Método para iniciar sesión.
   * @param usermobile Usuario móvil.
   * @param passwordmobile Contraseña móvil.
   * @returns Observable con la respuesta del servidor.
   */
  login(usermobile: string, passwordmobile: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { usermobile, passwordmobile };

    console.log('Enviando solicitud de login:', body);

    return this.http.post(url, body, { headers });
  }
}
