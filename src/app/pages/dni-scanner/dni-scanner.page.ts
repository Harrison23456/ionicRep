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
  esLudopata: boolean | null = null; // Para almacenar si es ludópata
  ludopataMessage: any;
  agravioMessage: any;
  imagenString: string = '';

  constructor(private dniSearchService: DnisearchService) {}

  ngOnInit(): void {
    this.installGoogleModule();
    this.scanBarcode();

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
    this.esLudopata = null;

    // Obtener el Android ID
    try {
      const resultado = await AndroidId['getAndroidId']();
      this.aId1 = resultado.androidId;
      this.errorMessag2 = null;
    } catch (error) {
      console.error('Error obteniendo el Android ID', error);
      this.errorMessag2 = 'No se pudo obtener el Android ID.';
      this.aId1 = null;
    }

    // Obtener el token del usuario
    const token = localStorage.getItem('token');
    let nombre_user = '';
    let apellidoPaterno_user = '';
    let apellidoMaterno_user = '';
    let empresa = '';
    let androidId = this.aId1 ?? 'ID no disponible';
    let userId = '';

    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        userId = decodedToken.user._id;
        nombre_user = decodedToken.user.name || 'Usuario no especificado';
        apellidoPaterno_user = decodedToken.user.paternalsurname || 'Usuario no especificado';
        apellidoMaterno_user = decodedToken.user.maternalsurname || 'Usuario no especificado';
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

    // Buscar datos del DNI
    this.dniSearchService.getDniData(dni).subscribe({
      next: (data) => {
        const consulta = {
          ...data,
          userId,
          nombre_user,
          apellidoPaterno_user,
          apellidoMaterno_user,
          empresa,
          tipo: 'barcode',
          androidId,
        };

        this.scannedData = data;
        this.dniSearchService.guardarConsulta(consulta).subscribe(
          () => console.log('Consulta guardada exitosamente.'),
          (error) => console.error('Error al guardar la consulta:', error)
        );

        // Buscar si el DNI pertenece a un ludópata
        this.dniSearchService.buscarLudopata(dni).subscribe({
          next: (response) => {
            this.imagenString = response.datos.imagen;
            console.log('Respuesta de buscarLudopata:', response); // Verifica la respuesta real de la API
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
        

        this.dniSearchService.buscarAgravio(dni).subscribe({
          next: (response) => {
            if (response.datos) {
              this.agravioMessage = `⚠️ El usuario tiene un agravio registrado: ${response.datos.tipoDeAgravio}`;
            } else {
              this.agravioMessage = '';
            }
          },
          error: (error) => {
            console.error('Error al buscar ludópata:', error);
          },
        });


        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al obtener los datos.';
        this.loading = false;
      },
    });
  }
}