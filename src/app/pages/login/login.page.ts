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

  async ngOnInit() {
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
  usermobile: string = '';
  passwordmobile: string = '';
  androidId: string | null = null;
  errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  login() {
    console.log('Enviando datos de login:', { usermobile: this.usermobile, passwordmobile: this.passwordmobile });
    this.authService.login(this.usermobile, this.passwordmobile).subscribe(
      (response: any) => {
        console.log('Respuesta del servidor:', response);
        localStorage.setItem('token', response.token);
        this.router.navigate(['/menu']);
      },
      (error) => {
        console.error('Login failed:', error);
        this.errorMessage = 'Error en el inicio de sesión. Verifica tus credenciales o la conexión.';
      }
    );
  }

}
