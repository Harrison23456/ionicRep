import { Component, OnInit } from '@angular/core';
import * as Tesseract from 'tesseract.js'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DnisearchService } from 'src/app/services/dnisearch.service';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { Plugins } from '@capacitor/core';
const { AndroidId } = Plugins;


@Component({
  selector: 'app-dni-identification',
  templateUrl: './dni-identification.page.html',
  styleUrls: ['./dni-identification.page.scss'],
})

export class DniIdentificationPage implements OnInit {
  dniNumber: string | null = null; // Número de DNI detectado
  errorMessage: string | null = null; // Mensaje de error
  isLoading: boolean = false; // Indicador de carga
  result: any = null; // Resultado de la API
  aId1: string | null = null;
  errorMessag2: string | null = null;
  scannedNames: { firstName: string; lastName: string; middleName?: string } | null = null; // Nombres escaneados
  comparisonMessage: string | null = null; // Resultado de comparación
  cleanedText: any;

  constructor(private dniService: DnisearchService) {}

  ngOnInit(): void {}

  async captureImage() {
    try {
      this.errorMessage = null;
      this.dniNumber = null;
      this.result = null;
      this.comparisonMessage = null;
      this.isLoading = true;

      const image = await Camera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image?.dataUrl) {
        await this.processImage(image.dataUrl);
      } else {
        this.isLoading = false;
        this.errorMessage = 'No se pudo capturar la imagen.';
      }
    } catch (error) {
      console.error('Error al capturar la imagen:', error);
      this.isLoading = false;
      this.errorMessage = 'Hubo un error al capturar la imagen.';
    }
  }

  private async processImage(imageData: string) {
    try {
      const worker = Tesseract.createWorker({
        logger: (info) => console.log(info),
      });

      await worker.load();
      await worker.loadLanguage('spa');
      await worker.initialize('spa');

      const { data } = await worker.recognize(imageData);

      console.log('Texto completo reconocido por Tesseract:', data.text);

      this.dniNumber = this.extractDniNumber(data.text);
          // Limpieza adicional para nombres
    this.cleanedText = this.extractCleanedText(data.text);
      this.isLoading = false;

      if (!this.dniNumber) {
        this.errorMessage = 'No se detectó un número de DNI válido.';
      } else {
        this.errorMessage = null;
        await this.searchDni(this.dniNumber);
        if(!this.cleanedText){
          this.errorMessage='Ocurrió un error al detectar el texto';
        } else{
          this.errorMessage = null;
          this.compareNames();
        }
      }

      await worker.terminate();


    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      this.isLoading = false;
      this.errorMessage = 'Hubo un error al procesar la imagen.';
    }
  }

  private extractCleanedText(text: string): string {
    console.log('Texto original antes de limpieza para nombres:', text);
  
    // Limpiar el texto para obtener solo caracteres alfabéticos y mantener espacios
    text = text
      .replace(/</g, ' ') // Reemplazar '<' por un espacio para evitar palabras juntas
      .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '') // Eliminar todo lo que no sean letras o espacios
      .replace(/\s+/g, ' ') // Reemplazar múltiples espacios por uno solo
      .trim(); // Eliminar espacios al inicio y final
  
    console.log('Texto limpio para nombres:', text);
    return text;
  }
  
  

  private extractDniNumber(text: string): string | null {
    console.log('Texto original antes de limpieza:', text);

    text = text
      .replace(/O/g, '0')
      .replace(/([0-9])<([0-9])/g, '$1 $2')
      .replace(/[<]/g, '')
      .replace(/([0-9])([A-Za-z])([0-9])/g, '$1 $3')
      .replace(/[^\d\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    console.log('Texto después de limpieza:', text);

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

  private async searchDni(dni: string) {
    this.isLoading = true;

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
        userId = decodedToken.user._id;
        nombre_user = decodedToken.user.name || 'Usuario no especificado';
        apellidoPaterno_user = decodedToken.user.paternalsurname || 'Usuario no especificado';
        apellidoMaterno_user = decodedToken.user.maternalsurname || 'Usuario no especificado';
        empresa = decodedToken.user.company.name || 'Empresa no especificada';
        androidId = this.aId1 ?? 'ID no disponible';
      } catch (error) {
        console.error('Error al decodificar el token:', error);
        this.errorMessage = 'Error al procesar la información del usuario.';
        this.isLoading = false;
        return;
      }
    } else {
      this.errorMessage = 'No se encontró el token. Por favor, inicie sesión.';
      this.isLoading = false;
      return;
    }

    try {
      this.result = await this.dniService.getDniData(dni).toPromise();
      console.log('Resultado de la API:', this.result);

      const consulta = {
        ...this.result,
        userId,
        nombre_user,
        apellidoPaterno_user,
        apellidoMaterno_user,
        empresa,
        tipo: 'automático',
        androidId,
      };

      await this.dniService.guardarConsulta(consulta).toPromise();
      console.log('Consulta guardada exitosamente.');
      this.errorMessage = null;
    } catch (error) {
      console.error('Error al buscar el DNI o guardar la consulta:', error);
      this.result = null;
      this.errorMessage =
        (error as HttpErrorResponse).message || 'Error desconocido al buscar el DNI.';
    } finally {
      this.isLoading = false;
    }
  }

  private compareNames() {
    if (this.result) {
      // Normalizar texto del OCR y los datos de la API
      const cleanedText = this.cleanedText?.toLowerCase().replace(/\s+/g, ' ').trim() || '';
      const nombresApi = (this.result?.nombres || '').toLowerCase().trim();
      const apellidoPaternoApi = (this.result?.apellidoPaterno || '').toLowerCase().trim();
  
      // Dividir los nombres en palabras
      const nombresApiParts = nombresApi.split(' ');
      const primerNombre = nombresApiParts[0] || ''; // Primer nombre obligatorio
      const segundoNombre = nombresApiParts[1] || ''; // Segundo nombre opcional
  
      // Normalizamos apellido paterno
      const apellidoPaternoApiParts = apellidoPaternoApi.split(' ');
      const apellidoPaterno = apellidoPaternoApiParts[0] || ''; // Solo verificamos el primer apellido
  
      console.log(`Primer nombre de la API: ${primerNombre}`);
      console.log(`Segundo nombre de la API (opcional): ${segundoNombre}`);
      console.log(`Apellido paterno de la API: ${apellidoPaterno}`);
  
      // Verificar coincidencias
      const primerNombreMatch = primerNombre && cleanedText.includes(primerNombre);
      const segundoNombreMatch = !segundoNombre || cleanedText.includes(segundoNombre); // Verificar solo si existe
      const apellidoPaternoMatch = apellidoPaterno && cleanedText.includes(apellidoPaterno);
  
      // Determinar mensaje de comparación
      if (primerNombreMatch && apellidoPaternoMatch && segundoNombreMatch) {
        this.comparisonMessage = 'DNI válido';
      } else {
        this.comparisonMessage = 'Los datos no coinciden con los del DNI';
      }
    } else {
      this.comparisonMessage = 'No se pudo realizar la comparación de nombres y apellidos.';
    }
  
    console.log(this.comparisonMessage);
  }
  
  
  private isValidDni(dni: string): boolean {
    return dni.length === 8 && !isNaN(Number(dni));
  }
}