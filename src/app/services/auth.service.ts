import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { interval, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private pingSubscription: Subscription | undefined;

  private apiUrl = 'https://44.201.220.104.nip.io/api/api/mobileroute'; // URL base del backend
  private apiURL = 'https://44.201.220.104.nip.io/api/api/auth'; // Usa tu misma URL base

  constructor(private http: HttpClient) {}

  /**
   * Método para iniciar sesión.
   * @param usermobile Usuario móvil.
   * @param passwordmobile Contraseña móvil.
   * @returns Observable con la respuesta del servidor.
   */
  login(usermobile?: string, passwordmobile?: string, imei?: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    // Construir dinámicamente el cuerpo de la solicitud según los parámetros proporcionados
    const body: any = {};
    if (usermobile) body.usermobile = usermobile;
    if (passwordmobile) body.passwordmobile = passwordmobile;
    if (imei) {
      body.androidId = imei;
      localStorage.setItem('androidId', imei); // ✅ Guárdalo aquí
    }
      

    return this.http.post(url, body, { headers }).pipe(
      // Después de un login exitoso, enviar el ping al backend
      // Recuerda que en la respuesta se debe recibir el token para usarlo
      tap((response: any) => {
        const token = response.token;
        if (token) {
          localStorage.setItem('token', token); // Guardar el token en el localStorage
          this.pingUser(token); // Hacer el ping al backend
        }
      })
    );
    }
  
  loginWithImei(imei: string): Observable<any> {
    const url = `${this.apiUrl}/login`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { imei };
  
    console.log('Enviando solicitud de login con Android ID:', body);
  
    return this.http.post(url, body, { headers });
  }
  

  getCompany(userId: string, token: string): Observable<{ empresa: string }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<{ empresa: string }>(`${this.apiUrl}/getCompany`, {
      headers,
      params: { id: userId }, // Pasar el ID como parámetro de consulta
    });
  }

  /**
   * Método para hacer ping al backend y actualizar el campo lastPing del usuario.
   * @param token Token de autenticación
   */
  pingUser(token: string) {
    console.log('Enviando ping al backend...');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const androidId = localStorage.getItem('androidId');

    let url = `${this.apiURL}/ping`;
    if (androidId) {
      url += `?imei=${androidId}`; // 🔹 Pasamos el androidId al backend
    }

    this.http.get(url, { headers }).subscribe({
      next: () => console.log('Ping enviado correctamente'),
      error: (err) => console.error('Error al enviar el ping', err),
    });
  }

  /**
   * Método para iniciar el ping cada cierto intervalo (30 segundos).
   */
  startPinging() {
    if (!this.pingSubscription) {
      this.pingSubscription = interval(5000)  // Cada 30 segundos
        .subscribe(() => {
          const token = localStorage.getItem('token');
          if (token) {
            this.pingUser(token); // Llamamos a pingUser con el token
          }
        });
    }
  }

  /**
   * Detener el ping
   */
  stopPinging() {
    this.pingSubscription?.unsubscribe();
    this.pingSubscription = undefined;
  }

  logoutFromBackend(headers: HttpHeaders): Observable<any> {
    const url = `${this.apiUrl}/logout`; // Asegúrate de que esta URL sea la correcta
    return this.http.post(url, {}, { headers });
  }
  
}
