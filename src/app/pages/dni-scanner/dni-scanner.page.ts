import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { DnisearchService } from 'src/app/services/dnisearch.service';
import { jwtDecode } from 'jwt-decode';
import { Plugins } from '@capacitor/core';
const { AndroidId } = Plugins;


@Component({
  selector: 'app-dni-scanner',
  templateUrl: './dni-scanner.page.html',
  styleUrls: ['./dni-scanner.page.scss'],
})
export class DniScannerPage implements OnInit {
  scannedDni: string | null = null;
  scannedData: any = null; // Almacena los datos obtenidos de la API
  loading: boolean = false;
  errorMessage: string | null = null;
  aId1: string | null = null;
  errorMessag2: string | null = null;

  constructor(private dniSearchService: DnisearchService) {}

  ngOnInit(): void {
    this.installGoogleModule();
  }

  async installGoogleModule() {
    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    } catch (error) {
      console.error(
        'Error al instalar el módulo de Google Barcode Scanner:',
        error
      );
    }
  }

  async scanBarcode() {
    try {
      const result = await BarcodeScanner.scan();
      if (result.barcodes.length > 0) {
        const barcodeData = result.barcodes[0].displayValue;
        this.scannedDni = this.extractDni(barcodeData || '');

        if (this.scannedDni) {
          // Llama a la API para obtener los datos del DNI
          this.fetchDniData(this.scannedDni);
        } else {
          this.errorMessage = 'No se detectó un número de DNI válido.';
        }
      } else {
        this.errorMessage = 'No se detectó ningún código.';
      }
    } catch (error) {
      console.error('Error escaneando el código de barras:', error);
      this.errorMessage = 'Error escaneando el código de barras.';
    }
  }

  extractDni(barcodeData: string): string | null {
    const dniRegex = /\d{8}/; // Patrón para encontrar 8 dígitos (DNI)
    const match = barcodeData.match(dniRegex);
    return match ? match[0] : null;
  }

  async fetchDniData(dni: string) {
    this.loading = true;
    this.scannedData = null;
    this.errorMessage = null;
  
     // Obtener el token del usuario
     const token = localStorage.getItem('token'); // Cambiar a sessionStorage si es necesario
     let nombre_user = '';
     let apellidoPaterno_user = '';
     let apellidoMaterno_user = '';
     let empresa = '';
     let androidId = '';
     let userId = '';
     try {
      const resultado = await AndroidId['getAndroidId']();
      this.aId1 = resultado.androidId;
      this.errorMessag2 = null;
    } catch (error) {
      console.error('Error getting Android ID', error);
      this.errorMessag2 = 'No se pudo obtener el Android ID.';
      this.aId1 = null;
    }


     if (token) {
       try {
         const decodedToken: any = jwtDecode(token);
         console.log(decodedToken)
         userId = decodedToken.user._id;
         nombre_user = decodedToken.user.name || 'Usuario no especificado';
         apellidoPaterno_user = decodedToken.user.paternalsurname || 'Usuario no especificado';
         apellidoMaterno_user = decodedToken.user.maternalsurname || 'Usuario no especificado';

         empresa = decodedToken.user.company.name || 'Empresa no especificada';
         androidId = this.aId1 ?? 'ID no disponible'; // Usa 'ID no disponible' si this.aId1 es null

       } catch (error) {
         console.error('Error al decodificar el token:', error);
         this.errorMessage = 'Error al procesar la información del usuario.';
         return;
       }
     } else {
       this.errorMessage = 'No se encontró el token. Por favor, inicie sesión.';
       return;
     }
     
    this.dniSearchService.getDniData(dni).subscribe(
      (data) => {

        const consulta = {
          ...data,
          userId,
          nombre_user,
          apellidoPaterno_user,
          apellidoMaterno_user,
          empresa,
          tipo: 'barcode',
          androidId 
        };
        this.dniSearchService.guardarConsulta(consulta).subscribe(
          () => console.log('Consulta guardada exitosamente.'),
          (error) => console.error('Error al guardar la consulta:', error)
        );
        this.errorMessage = ''; // Limpiar mensajes de error
        this.scannedData = data; // Almacena los datos de la API

        this.loading = false;
      },
      (error) => {
        this.errorMessage = error.message || 'Error al obtener los datos.';
        this.loading = false;
      }
    );
  }
}