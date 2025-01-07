import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { DnisearchService } from 'src/app/services/dnisearch.service';


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

  fetchDniData(dni: string) {
    this.loading = true;
    this.scannedData = null;
    this.errorMessage = null;

    this.dniSearchService.getDniData(dni).subscribe(
      (data) => {
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