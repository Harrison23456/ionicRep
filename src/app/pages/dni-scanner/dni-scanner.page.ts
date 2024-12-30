import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';


@Component({
  selector: 'app-dni-scanner',
  templateUrl: './dni-scanner.page.html',
  styleUrls: ['./dni-scanner.page.scss'],
})
export class DniScannerPage implements OnInit {
  ngOnInit(): void {
  }

  scannedDni: string | null = null;

  constructor() {}

  async scanBarcode() {
    try {
      const result = await BarcodeScanner.scan();
      if (result.barcodes.length > 0) {
        // Buscar el número del DNI en el texto escaneado
        const barcodeData = result.barcodes[0].displayValue;
        this.scannedDni = this.extractDni(barcodeData || '');
      } else {
        this.scannedDni = 'No se detectó ningún código.';
      }
    } catch (error) {
      console.error('Error escaneando el código de barras:', error);
      this.scannedDni = 'Error escaneando el código de barras.';
    }
  }

  // Método para extraer el DNI del texto escaneado
  extractDni(barcodeData: string): string | null {
    const dniRegex = /\d{8}/; // Patrón para encontrar 8 dígitos (DNI)
    const match = barcodeData.match(dniRegex);
    return match ? match[0] : null;
  }

}
