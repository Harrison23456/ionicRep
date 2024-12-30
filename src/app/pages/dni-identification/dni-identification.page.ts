import { Component, OnInit } from '@angular/core';
import * as Tesseract from 'tesseract.js'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';


@Component({
  selector: 'app-dni-identification',
  templateUrl: './dni-identification.page.html',
  styleUrls: ['./dni-identification.page.scss'],
})
export class DniIdentificationPage implements OnInit {
  dniNumber: string | null = null; // Número de DNI detectado
  errorMessage: string | null = null; // Mensaje de error

  constructor() {}
  ngOnInit(): void {
  }

  async captureImage() {
    try {
      // Abrir la cámara y capturar una imagen
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Obtiene la imagen en formato base64
        source: CameraSource.Camera, // Usa la cámara del dispositivo
      });

      if (image?.dataUrl) {
        this.processImage(image.dataUrl);
      } else {
        this.errorMessage = 'No se pudo capturar la imagen.';
      }
    } catch (error) {
      console.error('Error al capturar la imagen:', error);
      this.errorMessage = 'Hubo un error al capturar la imagen.';
    }
  }

  private processImage(imageData: string) {
    Tesseract.recognize(imageData, 'spa') // Configurado para texto en español
      .then(({ data: { text } }) => {
        this.dniNumber = this.extractDniNumber(text);
        if (!this.dniNumber) {
          this.errorMessage = 'No se detectó un número de DNI válido.';
        } else {
          this.errorMessage = null; // Limpia cualquier error previo
        }
      })
      .catch((error) => {
        console.error('Error al procesar la imagen:', error);
        this.errorMessage = 'Hubo un error al procesar la imagen.';
      });
  }

  private extractDniNumber(text: string): string | null {
    // Regex para buscar un número de DNI (8 dígitos)
    const dniRegex = /\b\d{8}\b/;
    const match = text.match(dniRegex);
    return match ? match[0] : null;
  }
}
