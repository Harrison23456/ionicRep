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
  isLudopataLocal: boolean = false;

  constructor(private dniService: DnisearchService) {}

  ngOnInit() {}

  async searchDni() {
    if (!this.dni || this.dni.length !== 8) {
      this.errorMessage = 'Por favor, ingrese un DNI válido de 8 dígitos.';
      return;
    }

    // Limpiar estado anterior
    this.result = null;
    this.errorMessage = '';
    this.ludopataMessage = '';
    this.agravioMessage = '';
    this.imagenString = '';
    this.isLudopataLocal = false;

    // Obtener Android ID
    try {
      const resultado = await AndroidId['getAndroidId']();
      this.aId1 = resultado.androidId;
    } catch (error) {
      this.errorMessage = 'No se pudo obtener el Android ID.';
    }

    // Obtener info del token
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

    this.dniService.buscarLudopata(this.dni).subscribe({
      next: (response) => {
        console.log('Respuesta de buscarLudopata:', response);

        if (response?.esLudopata && response.datos) {
          const datos = response.datos;

          this.result = {
            dni: datos.dni,
            nombres: datos.nombre || 'No disponible',
            apellidoPaterno: datos.apellidoPaterno || 'No disponible',
            apellidoMaterno: datos.apellidoMaterno || 'No disponible'
          };

          this.imagenString = datos.imagen?.replace(/\\/g, '/') ?? '';
          this.isLudopataLocal = true;
          this.ludopataMessage = '✅ ¡El usuario está registrado como ludópata en base local!';
        } else {
          this.isLudopataLocal = false;
          this.ludopataMessage = '⚠️ El usuario NO está registrado como ludópata en la base local.';
          this.buscarEnApi(userId, nombre_user, apellidoPaterno_user, apellidoMaterno_user, empresa);
        }

      },
      error: (error) => {
        this.errorMessage = 'Error al buscar en la base de datos local.';
        console.error(error);
      }
    });


    // Buscar agravios (independiente)
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
  }

  buscarEnApi(userId: string, nombre_user: string, apellidoPaterno_user: string, apellidoMaterno_user: string, empresa: string) {
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
      }
    });
  }
}