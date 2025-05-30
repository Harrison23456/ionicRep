import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { AuthService } from 'src/app/services/auth.service';
const { AndroidId } = Plugins;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  usermobile: string = '';
  passwordmobile: string = '';
  androidId: any;
  errorMessage: string | null = null;
  errorMessageUser: string | null = null;
  errorMessagePassword: string | null = null;
  rememberMe: boolean = false;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    this.loadRememberedCredentials();
    try {
      const result = await AndroidId['getAndroidId']();
      console.log('Android ID:', result.androidId);
      this.androidId = result.androidId;
      localStorage.setItem('androidId', result.androidId); // 🔹 Guardamos el androidId para usarlo después
      this.errorMessage = null;
    } catch (error) {
      console.error('Error getting Android ID', error);
      this.errorMessage = 'No se pudo obtener el Android ID.';
      this.androidId = null;
    }
  }

  login() {
    this.errorMessageUser = null;
    this.errorMessagePassword = null;
    this.errorMessage = null;

    if (!this.usermobile.trim()) {
      this.errorMessageUser = 'El campo Usuario no puede estar vacío.';
    }
    if (!this.passwordmobile.trim()) {
      this.errorMessagePassword = 'El campo Contraseña no puede estar vacío.';
    }

    if (this.errorMessageUser || this.errorMessagePassword) {
      return;
    }

    this.authService.login(this.usermobile, this.passwordmobile, this.androidId).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        localStorage.setItem('token', response.token);
        this.authService.startPinging();  // <-- Añade esta línea

        if (this.rememberMe) {
          this.saveCredentials();
        } else {
          this.clearRememberedCredentials();
        }
        this.router.navigate(['/menu']);
      },
      (error) => {
        console.error('Login failed:', error);
        if (error.status === 404) {
          this.errorMessage = 'Usuario o empresa no encontrada.';
        } else if (error.status === 400) {
          this.errorMessage = 'Credenciales inválidas. Verifica tu usuario y contraseña.';
        } else if (error.status === 403) {
          if (error.error.error === 'La empresa está desactivada') {
            this.errorMessage = 'La empresa está desactivada. Contacte al administrador.';
          } else if (error.error.error === 'La fecha de expiración de la empresa ha pasado') {
            this.errorMessage = 'La empresa ha expirado. Contacte al administrador.';
          } else if (error.error.error === 'El dispositivo no está asociado a este usuario') {
            this.errorMessage = 'Este dispositivo no está autorizado para este usuario.';
          } else {
            this.errorMessage = 'Acceso denegado. Verifica tus credenciales.';
          }
        } else {
          this.errorMessage = 'Error en el inicio de sesión. Intenta nuevamente.';
        }
      }
    );
  }

  private saveCredentials() {
    const credentials = {
      usermobile: this.usermobile,
      passwordmobile: this.passwordmobile,
    };
    localStorage.setItem('rememberedCredentials', JSON.stringify(credentials));
  }

  private loadRememberedCredentials() {
    const credentials = localStorage.getItem('rememberedCredentials');
    if (credentials) {
      const parsedCredentials = JSON.parse(credentials);
      this.usermobile = parsedCredentials.usermobile || '';
      this.passwordmobile = parsedCredentials.passwordmobile || '';
      this.rememberMe = true;
    }
  }

  private clearRememberedCredentials() {
    localStorage.removeItem('rememberedCredentials');
  }
}