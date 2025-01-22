import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { jwtDecode } from "jwt-decode";
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  constructor(public authService: AuthService, private alertController: AlertController, private router: Router) { }
  empresa: string | null = null;
  userId: string = ''; // Obtén esto del almacenamiento local o como se maneje en tu app
  token: string = '';  // Obtén el token del almacenamiento local o donde lo guardes

  ngOnInit() {
    this.token = localStorage.getItem('token') || ''; // Obtén el token

    if (this.token) {
      // Decodifica el token para obtener el userId
      const decodedToken: any = jwtDecode(this.token);
      this.userId = decodedToken.id || ''; // Ajusta el nombre del campo según tu backend

      if (this.userId) {
        this.authService.getCompany(this.userId, this.token).subscribe({
          next: (response) => {
            this.empresa = response.empresa;
          },
          error: (err) => {
            console.error('Error al obtener la empresa:', err);
          },
        });
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
    // Eliminar el token del localStorage (o cualquier almacenamiento que uses)
    localStorage.removeItem('token');

    // Redirigir al login
    this.router.navigate(['/login']);
  }
  
}
