import { Component, OnInit } from '@angular/core';
import { DnisearchService } from 'src/app/services/dnisearch.service';
import { jwtDecode } from 'jwt-decode';
import { Plugins } from '@capacitor/core';
const { AndroidId } = Plugins;

@Component({
  selector: 'app-dni-manualsearch',
  templateUrl: './dni-manualsearch.page.html',
  styleUrls: ['./dni-manualsearch.page.scss'],
})
export class DniManualsearchPage implements OnInit {
  dni: string = '';
  result: any = null;
  errorMessage: string = '';
  aId1: string | null = null;
  ludopataMessage: string = '';
  imagenString: string = '';
  agravioMessage: string = '';

  constructor(
    private dniService: DnisearchService,
  ) {}

  ngOnInit() {}

  async searchDni() {
    if (!this.dni || this.dni.length !== 8) {
      this.errorMessage = 'Por favor, ingrese un DNI válido de 8 dígitos.';
      return;
    }

    // 👉 Limpiar datos previos antes de buscar
    this.result = null;
    this.errorMessage = '';
    this.ludopataMessage = '';
    this.agravioMessage = '';
    this.imagenString = '';

    // Obtener Android ID
    try {
      const resultado = await AndroidId['getAndroidId']();
      this.aId1 = resultado.androidId;
    } catch (error) {
      this.errorMessage = 'No se pudo obtener el Android ID.';
    }

    // Obtener información del usuario desde el token
    const token = localStorage.getItem('token');
    if (!token) {
      this.errorMessage = 'No se encontró el token. Inicie sesión.';
      return;
    }

    let userId = '';
    let nombre_user = '';
    let apellidoPaterno_user = '';
    let apellidoMaterno_user = '';
    let empresa = '';

    try {
      const decodedToken: any = jwtDecode(token);
      userId = decodedToken.user._id;
      nombre_user = decodedToken.user.name || 'No especificado';
      apellidoPaterno_user = decodedToken.user.paternalsurname || 'No especificado';
      apellidoMaterno_user = decodedToken.user.maternalsurname || 'No especificado';
      empresa = decodedToken.user.company.name || 'No especificada';
    } catch (error) {
      this.errorMessage = 'Error al decodificar el token.';
      return;
    }

    // Buscar si es ludópata
    this.dniService.buscarLudopata(this.dni).subscribe({
      next: (response) => {
        this.imagenString = response.datos?.imagen ?? '';  // Previene errores si no hay imagen
        if (response.esLudopata) {
          this.ludopataMessage = '⚠️ ¡El usuario está registrado como ludópata!';
        } else {
          this.ludopataMessage = '✅ El usuario no está registrado como ludópata.';
        }
      },
      error: (error) => {
        console.error('Error al buscar ludópata:', error);
      },
    });

    // Buscar agravios
    this.dniService.buscarAgravio(this.dni).subscribe({
      next: (response) => {
        if (response.tieneAgravio) {
          if (response.datos?.tipoDeAgravio) {
            this.agravioMessage = `⚠️ Se ha encontrado un agravio registrado en la empresa: ${response.datos.tipoDeAgravio}`;
          } else {
            this.agravioMessage = '⚠️ El agravio registrado no tiene un tipo de agravio definido.';
          }
        } else {
          this.agravioMessage = '';
        }
      },
      error: (error) => {
        console.error('Error al buscar agravios:', error);
      },
    });

    // Buscar DNI
    this.dniService.getDniData(this.dni).subscribe({
      next: (data) => {
        this.result = data;

        const consulta = {
          ...data,
          userId,
          nombre_user,
          apellidoPaterno_user,
          apellidoMaterno_user,
          empresa,
          androidId: this.aId1 ?? 'ID no disponible',
          tipo: 'manual',
        };

        this.dniService.guardarConsulta(consulta).subscribe();
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al buscar el DNI.';
      },
    });
  }

}