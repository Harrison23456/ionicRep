import { Injectable } from '@angular/core';
import { CameraPreview, CameraPreviewOptions } from '@capacitor-community/camera-preview';
import * as Tesseract from 'tesseract.js'
import { parse } from 'mrz';

@Injectable({
  providedIn: 'root'
})
export class DniScannerService {

  private worker: Tesseract.Worker | null = null;
  scanning = false;

  constructor() {}

  async startCamera() {
    const options: CameraPreviewOptions = {
      position: 'rear',
      width: window.innerWidth,
      height: window.innerHeight,
      toBack: true,
      disableAudio: true,
    };
    await CameraPreview.start(options);
  }

  async stopCamera() {
    await CameraPreview.stop();
  }

  async scanDni(callback: (dni: string | null) => void) {
    this.scanning = true;
  
    try {
      // Inicializar Tesseract
      this.worker = await Tesseract.createWorker({
        logger: (info) => console.log(info), // Para depuración
      });
  
      // Cargar el idioma necesario (por ejemplo, 'spa' para español)
      await this.worker.loadLanguage('spa');
      await this.worker.initialize('spa');
  
      while (this.scanning) {
        const frame = await CameraPreview.capture({ quality: 85 });
        const imageSrc = `data:image/jpeg;base64,${frame.value}`;
  
        // Procesar la imagen con OCR
        const { data } = await this.worker.recognize(imageSrc);
        const text = data.text.replace(/\s+/g, ''); // Limpiar espacios
        console.log('Texto OCR detectado:', text);
  
        // Extraer el número de DNI
        const dniNumber = this.extractDniNumber(text);
        if (dniNumber) {
          callback(dniNumber);
          this.scanning = false;
          await this.worker.terminate(); // Terminar el Worker después de encontrar el DNI
          return;
        }
  
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de la siguiente captura
      }
    } catch (error) {
      console.error('Error durante el escaneo:', error);
      this.scanning = false;
      if (this.worker) {
        await this.worker.terminate(); // Asegurarse de terminar el Worker en caso de error
      }
    }
  }

  private extractDniNumber(text: string): string | null {
    console.log('Texto original antes de limpieza:', text);

    // Limpiar el texto
    text = text
      .replace(/O/g, '0') // Reemplazar 'O' por '0'
      .replace(/[^\d]/g, '') // Eliminar todo lo que no sean dígitos
      .trim();

    console.log('Texto después de limpieza:', text);

    // Buscar un número de 8 dígitos
    const dniRegex = /\b\d{8}\b/g;
    const matches = text.match(dniRegex);
    console.log('Posibles coincidencias de DNI:', matches);

    if (matches) {
      for (const match of matches) {
        if (this.isValidDni(match)) {
          console.log('Número de DNI válido encontrado:', match);
          return match;
        } else {
          console.log('Número descartado (inválido):', match);
        }
      }
    }

    console.log('No se detectó un número de DNI válido.');
    return null;
  }

  private isValidDni(dni: string): boolean {
    return dni.length === 8 && !isNaN(Number(dni));
  }
}
