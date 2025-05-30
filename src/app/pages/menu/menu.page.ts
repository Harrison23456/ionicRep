import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from "jwt-decode";
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit, OnDestroy {

  empresa: string | null = null;
  userId: string = '';
  token: string = '';

  constructor(
    public authService: AuthService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';

    if (this.token) {
      const decodedToken: any = jwtDecode(this.token);
      this.userId = decodedToken.id || '';

      if (this.userId) {
        this.authService.getCompany(this.userId, this.token).subscribe({
          next: (response) => {
            this.empresa = response.empresa;
          },
          error: (err) => {
            console.error('Error al obtener la empresa:', err);
          },
        });

        this.authService.startPinging(); // 🔹 Inicia ping automático cada 30s
      }
    }
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Está seguro de que desea cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          role: 'confirm',
          handler: () => this.logout(),
        },
      ],
    });

    await alert.present();
  }

  logout() {
    const token = localStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

      this.authService.logoutFromBackend(headers).subscribe({
        next: () => {
          console.log('Sesión cerrada correctamente en el backend');
          this.authService.stopPinging(); // 🔹 Detiene el ping automático
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
        error: (err: any) => {
          console.error('Error cerrando sesión en el backend', err);
          this.authService.stopPinging();
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
      });
    } else {
      this.authService.stopPinging();
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.authService.stopPinging(); // 🔹 Asegura detener el ping al destruir componente
  }
}