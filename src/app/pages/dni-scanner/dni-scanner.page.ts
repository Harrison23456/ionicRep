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
  scannedData: any = null;
  loading: boolean = false;
  errorMessage: string | null = null;
  aId1: string | null = null;
  ludopataMessage: string = '';
  agravioMessage: string = '';
  imagenString: string = '';
  esLudopata: boolean = false;

  constructor(private dniSearchService: DnisearchService) {}

  ngOnInit(): void {
    this.installGoogleModule();
    this.scanBarcode();
  }

  async installGoogleModule() {
    try {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
    } catch (error) {
      console.error('Error al instalar el módulo de Google Barcode Scanner:', error);
    }
  }

  async scanBarcode() {
    try {
      const result = await BarcodeScanner.scan();
      if (result.barcodes.length > 0) {
        const barcodeData = result.barcodes[0].displayValue;
        this.scannedDni = this.extractDni(barcodeData || '');

        if (this.scannedDni) {
          this.loading = true;
          await this.buscarDniConLogicaLocalYApi(this.scannedDni);
          this.loading = false;
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

  async buscarDniConLogicaLocalYApi(dni: string) {
    this.errorMessage = '';
    this.ludopataMessage = '';
    this.agravioMessage = '';
    this.imagenString = '';
    this.esLudopata = false;
    this.scannedData = null;

    // Obtener Android ID
    try {
      const resultado = await AndroidId['getAndroidId']();
      this.aId1 = resultado.androidId;
    } catch (error) {
      this.errorMessage = 'No se pudo obtener el Android ID.';
      console.error(error);
      return;
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

    // Buscar en base local primero
    this.dniSearchService.buscarLudopata(dni).subscribe({
      next: (response) => {
        if (response?.esLudopata && response.datos) {
          const datos = response.datos;
          this.scannedData = {
            dni: datos.dni,
            nombres: datos.nombre || 'No disponible',
            apellidoPaterno: datos.apellidoPaterno || 'No disponible',
            apellidoMaterno: datos.apellidoMaterno || 'No disponible',
          };
          this.imagenString = datos.imagen?.replace(/\\/g, '/') ?? '';
          this.esLudopata = true;
          this.ludopataMessage = '✅ ¡El usuario está registrado como ludópata en base local!';
        } else {
          this.esLudopata = false;
          this.ludopataMessage = '⚠️ El usuario NO está registrado como ludópata en la base local.';
          this.buscarEnApi(dni, userId, nombre_user, apellidoPaterno_user, apellidoMaterno_user, empresa);
        }
      },
      error: (error) => {
        this.errorMessage = 'Error al buscar en la base de datos local.';
        console.error(error);
      },
    });

    // Buscar agravios (independiente)
    this.dniSearchService.buscarAgravio(dni).subscribe({
      next: (response) => {
        if (response.tieneAgravio && response.datos?.tipoDeAgravio) {
          this.agravioMessage = `⚠️ Se ha encontrado un agravio registrado en la empresa: ${response.datos.tipoDeAgravio}`;
        } else {
          this.agravioMessage = '';
        }
      },
      error: (error) => {
        console.error('Error al buscar agravios:', error);
      },
    });
  }

  buscarEnApi(
    dni: string,
    userId: string,
    nombre_user: string,
    apellidoPaterno_user: string,
    apellidoMaterno_user: string,
    empresa: string
  ) {
    this.dniSearchService.getDniData(dni).subscribe({
      next: (data) => {
        this.scannedData = data;

        const consulta = {
          ...data,
          userId,
          nombre_user,
          apellidoPaterno_user,
          apellidoMaterno_user,
          empresa,
          androidId: this.aId1 ?? 'ID no disponible',
          tipo: 'barcode',
        };

        this.dniSearchService.guardarConsulta(consulta).subscribe(
          () => console.log('Consulta guardada exitosamente.'),
          (error) => console.error('Error al guardar la consulta:', error)
        );

        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al buscar el DNI.';
      },
    });
  }
}