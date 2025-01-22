import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { timeout } from 'rxjs';
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
  androidId: string | null = null;
  errorMessage: string | null = null;
  rememberMe: boolean = false; // Indica si el usuario quiere que se recuerden sus credenciales

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    // Intentar cargar credenciales guardadas
    this.loadRememberedCredentials();

    try {
      const result = await AndroidId['getAndroidId']();
      console.log('Android ID:', result.androidId);
      this.androidId = result.androidId;
      this.errorMessage = null;
    } catch (error) {
      console.error('Error getting Android ID', error);
      this.errorMessage = 'No se pudo obtener el Android ID.';
      this.androidId = null;
    }
  }

  login() {
    console.log('Enviando datos de login:', { usermobile: this.usermobile, passwordmobile: this.passwordmobile });
    this.authService.login(this.usermobile, this.passwordmobile).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);

        // Almacenar token en localStorage
        localStorage.setItem('token', response.token);

        // Si el usuario seleccionó "Recordarme", guardar credenciales
        if (this.rememberMe) {
          this.saveCredentials();
        } else {
          this.clearRememberedCredentials();
        }

        this.router.navigate(['/menu']);
      },
      (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Error en el inicio de sesión. Verifica tus credenciales o la conexión.';
      }
    );
  }

  private saveCredentials() {
    const credentials = {
      usermobile: this.usermobile,
      passwordmobile: this.passwordmobile,
    };
    localStorage.setItem('rememberedCredentials', JSON.stringify(credentials));
    console.log('Credenciales guardadas:', credentials);
  }

  private loadRememberedCredentials() {
    const credentials = localStorage.getItem('rememberedCredentials');
    if (credentials) {
      const parsedCredentials = JSON.parse(credentials);
      this.usermobile = parsedCredentials.usermobile || '';
      this.passwordmobile = parsedCredentials.passwordmobile || '';
      this.rememberMe = true; // Marcar el checkbox de "Recordarme"
      console.log('Credenciales cargadas:', parsedCredentials);
    }
  }

  private clearRememberedCredentials() {
    localStorage.removeItem('rememberedCredentials');
    console.log('Credenciales eliminadas');
  }
}