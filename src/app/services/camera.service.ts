import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import * as Tesseract from 'tesseract.js';


@Injectable({
  providedIn: 'root'
})
export class CameraService {

  constructor() {}

  /**
   * Captura una imagen usando la cámara.
   */
  async captureImage(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Error al capturar la imagen:', error);
      return null;
    }
  }

  /**
   * Procesa la imagen para extraer texto.
   */
  async processImage(imageData: string): Promise<string | null> {
    try {
      const { data: { text } } = await Tesseract.recognize(imageData, 'spa');
      return text;
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      return null;
    }
  }

  /**
   * Extrae un número de DNI del texto.
   */
  extractDniNumber(text: string): string | null {
    const dniRegex = /\b\d{8}\b/;
    const match = text.match(dniRegex);
    return match ? match[0] : null;
  }
}
