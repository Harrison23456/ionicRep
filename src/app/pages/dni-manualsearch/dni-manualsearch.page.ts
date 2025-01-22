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


  ngOnInit() {
  }
  dni: string = '';
  test: string = '';

  result: any = null;
  errorMessage: string = '';
  aId1: string | null = null;
  errorMessag2: string | null = null;

  constructor(private dniService: DnisearchService) {}
  async searchDni() {
    if (!this.dni || this.dni.length !== 8) {
      this.errorMessage = 'Por favor, ingrese un DNI válido de 8 dígitos.';
      return;
    }


        try {
          const resultado = await AndroidId['getAndroidId']();
          this.aId1 = resultado.androidId;
          this.errorMessag2 = null;
        } catch (error) {
          console.error('Error getting Android ID', error);
          this.errorMessag2 = 'No se pudo obtener el Android ID.';
          this.aId1 = null;
        }
  

        const token = localStorage.getItem('token'); 
        let nombre_user = '';
        let apellidoPaterno_user = '';
        let apellidoMaterno_user = '';
        let empresa = '';
        let androidId = '';
        let userId = '';
        if (token) {
          try {
            const decodedToken: any = jwtDecode(token);
            console.log(decodedToken)
            userId = decodedToken.user._id;
            nombre_user = decodedToken.user.name || 'Usuario no especificado';
            apellidoPaterno_user = decodedToken.user.paternalsurname || 'Usuario no especificado';
            apellidoMaterno_user = decodedToken.user.maternalsurname || 'Usuario no especificado';
            androidId = this.aId1 ?? 'ID no disponible'; 
            empresa = decodedToken.user.company.name || 'Empresa no especificada';
          } catch (error) {
            console.error('Error al decodificar el token:', error);
            this.errorMessage = 'Error al procesar la información del usuario.';
            return;
          }
        } else {
          this.errorMessage = 'No se encontró el token. Por favor, inicie sesión.';
          return;
        }

    this.dniService.getDniData(this.dni).subscribe({
      next: (data) => {
        this.result = data; // Guardar el resultado
        const consulta = {
          ...data,
          userId,
          nombre_user,
          apellidoPaterno_user,
          apellidoMaterno_user,
          empresa,
          androidId,
          tipo: 'manual', // Tipo distintivo
        };
        this.dniService.guardarConsulta(consulta).subscribe(
          () => console.log('Consulta guardada exitosamente.'),
          (error) => console.error('Error al guardar la consulta:', error)
        );
        this.errorMessage = ''; // Limpiar mensajes de error
      },
      error: (error) => {
        this.result = null; // Limpiar resultado anterior
        this.errorMessage = error.message || 'Error al buscar el DNI.';
      },
    });
  }
}
