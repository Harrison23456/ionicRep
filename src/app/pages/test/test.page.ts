import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DnisearchService } from 'src/app/services/dnisearch.service';
import { createWorker, Worker } from 'tesseract.js';
import { Plugins } from '@capacitor/core';
const { AndroidId } = Plugins;
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})

export class TestPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;

  worker!: Worker;
  extractedText: string = '';
  dni: string = '';
  scanning: boolean = false;
  loading: boolean = false;
  video!: HTMLVideoElement;
  canvas!: HTMLCanvasElement;
  overlay!: HTMLCanvasElement;
  ctx!: CanvasRenderingContext2D | null;
  overlayCtx!: CanvasRenderingContext2D | null;

  apellidoPaterno: string = '';
  primerNombre: string = '';
  segundoNombre: string = '';

  apiNombre1: string = '';
  apiNombre2: string = '';
  apiApellido: string = '';
  apiApellidoMaterno: string = '';

  nombresCoinciden: boolean | null = null;
  errorMessage: string = '';
  aId1: string | null = null;
  esLudopata: boolean | null = null;
  esAgravio: boolean | null = null;

  ludopataMessage: string = '';
  agravioMessage: string = '';
  imagenString: string = '';
  cameraReady: boolean = false;

  constructor(private apiService: DnisearchService) {}

  async ngOnInit(): Promise<void> {
    await this.initializeTesseract();
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initializeCamera();
    this.startScanning(); 
  }


  ngOnDestroy(): void {
    this.terminateWorker();
    this.closeCamera();
  }

  async initializeCamera(): Promise<void> {
    try {
      this.video = this.videoElement.nativeElement;
      this.canvas = this.canvasElement.nativeElement;
      this.overlay = this.overlayCanvas.nativeElement;
      this.ctx = this.canvas.getContext('2d');
      this.overlayCtx = this.overlay.getContext('2d');

      const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    });

    this.video.srcObject = stream;
    this.video.play();

    this.video.addEventListener('loadedmetadata', () => {
      this.overlay.width = this.video.videoWidth;
      this.overlay.height = this.video.videoHeight;
      this.drawFocusArea();
      this.cameraReady = true; // <-- Aquí activas el video
    });


      console.log('✅ Cámara inicializada.');
    } catch (error) {
      console.error('❌ Error al acceder a la cámara:', error);
    }
  }

  drawFocusArea(): void {
    if (!this.overlayCtx) return;

    this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
    this.overlayCtx.strokeStyle = 'white';
    this.overlayCtx.lineWidth = 3;

    const region = this.getOACIRegion();
    this.overlayCtx.strokeRect(region.x, region.y, region.width, region.height);
  }

  getOACIRegion() {
    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    const rectWidth = width * 0.7;
    const rectHeight = height * 0.1;

    return {
      x: (width - rectWidth) / 3.6,
      y: (height - rectHeight) / 1.5,
      width: rectWidth,
      height: rectHeight,
    };
  }

  async initializeTesseract(): Promise<void> {
    try {
      this.worker = await createWorker({
        logger: (m) => console.log('OCR progreso:', m),
      });

      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      console.log('✅ Worker de Tesseract inicializado.');
    } catch (error) {
      console.error('❌ Error al iniciar Tesseract:', error);
    }
  }

  startScanning(): void {
    this.scanning = true;
    this.scanFrames();
  }

  stopScanning(): void {
    this.scanning = false;
    this.closeCamera();
  }

  async scanFrames(): Promise<void> {
    if (!this.scanning || !this.ctx) return;

    const region = this.getOACIRegion();

    this.canvas.width = region.width;
    this.canvas.height = region.height;
    this.ctx.drawImage(
      this.video,
      region.x,
      region.y,
      region.width,
      region.height,
      0,
      0,
      region.width,
      region.height
    );

    const imageData = this.canvas.toDataURL('image/png');

    try {
      if (this.worker) {
        const { data } = await this.worker.recognize(imageData);

        const mrzPattern = /([A-Z<]{5,})\n?([0-9A-Z<]{10,})/g;
        const match = data.text.match(mrzPattern);

        if (match) {
          this.extractedText = match.join('\n');
          this.stopScanning();

          this.loading = true;

          const dniMatch = this.extractedText.replace(/D/g, '0').match(/\d{8}/);

          if (dniMatch) {
            this.dni = dniMatch[0];
            this.getApiData(this.dni);
          }

          this.extractNames();

          if (!this.dni || !this.apellidoPaterno || !this.primerNombre) {
            this.errorMessage = '❌ Error: Intente escanear nuevamente';
          }

          setTimeout(() => {
            this.loading = false;
          }, 3000);
        }
      }
    } catch (error) {
      console.error('❌ Error al procesar la imagen:', error);
    }

    if (this.scanning) {
      setTimeout(() => this.scanFrames(), 1000);
    }
  }

  extractNames(): void {
    const namePattern = /([A-Z]+)<<([A-Z]+)(?:<([A-Z]+))?/;
    const match = this.extractedText.match(namePattern);

    if (match) {
      this.apellidoPaterno = match[1].replace(/<+/g, ' ').trim();
      this.primerNombre = match[2].replace(/<+/g, ' ').trim();
      this.segundoNombre = match[3] ? match[3].replace(/<+/g, ' ').trim() : '';
    }
  }

  getApiData(dni: string): void {
    this.apiService.getDniData(dni).subscribe({
      next: (data: any) => {
        this.apiNombre1 = data.nombres.split(' ')[0];
        this.apiNombre2 = data.nombres.split(' ')[1] || '';
        this.apiApellido = data.apellidoPaterno;
        this.apiApellidoMaterno = data.apellidoMaterno;

        this.nombresCoinciden =
          this.apiNombre1 === this.primerNombre &&
          this.apiNombre2 === this.segundoNombre &&
          this.apiApellido === this.apellidoPaterno;

        // Solo guardar si los nombres coinciden
        if (this.nombresCoinciden) {
          // Guardar la consulta en la base de datos
          this.guardarConsulta(data);
          
          // Verificar si es ludópata
          this.verificarLudopata(dni);

          this.verificarAgravio(dni)
        } else {
          console.log('No se guardó la consulta porque los nombres no coinciden');
          this.errorMessage = '❌ Los nombres no coinciden con la base de datos. No se guardó la consulta.';
        }
      },
      error: (error) => {
        console.error('Error al obtener datos de la API:', error);
      }
    });
  }

  async guardarConsulta(data: any) {
    console.log('Esta es la data recibida:', data);
    // Obtener el Android ID
    try {
      const resultado = await AndroidId['getAndroidId']();
      this.aId1 = resultado.androidId;
    } catch (error) {
      console.error('Error obteniendo el Android ID', error);
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
        return;
      }
    }

    // Modificación clave: Aplanamos la estructura para que coincida con lo que espera el backend
    const consultaParaBackend = {
      numeroDocumento: this.dni,  // Cambiamos dni a numeroDocumento
      nombres: data.nombres,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      userId: userId,
      nombre_user: nombre_user,
      apellidoPaterno_user: apellidoPaterno_user,
      apellidoMaterno_user: apellidoMaterno_user,
      empresa: empresa,
      tipo: 'automático',
      androidId: androidId
    };

    console.log('Consulta a enviar (formato plano):', consultaParaBackend);

    this.apiService.guardarConsulta(consultaParaBackend).subscribe(
      () => console.log('Consulta guardada exitosamente.'),
      (error) => {
        console.error('Error al guardar la consulta:', error);
        if (error.error) {
          console.error('Detalles del error:', error.error);
        }
      }
    );
  }

  verificarLudopata(dni: string) {
    this.apiService.buscarLudopata(dni).subscribe({
      next: (response) => {
        this.esLudopata = response.esLudopata;
        this.imagenString = response.datos.imagen;
        if (response.esLudopata) {
          this.ludopataMessage = '⚠️ ¡El usuario está registrado como ludópata!';
        } else {
          this.ludopataMessage = '✅ El usuario no está registrado como ludópata.';
        }
      },
      error: (error) => {
        console.error('Error al buscar ludópata:', error);
      }
    });
  }

  verificarAgravio(dni: string) {
    this.apiService.buscarAgravio(dni).subscribe({
      next: (response) => {
        if (response.datos) {
          this.agravioMessage = `⚠️ El usuario tiene un agravio registrado: ${response.datos.tipoDeAgravio}`;
        } else {
          this.agravioMessage = '';
        }
      },
      error: (error) => {
        console.error('Error al buscar agravio:', error);
      }
    });
  }


    closeCamera(): void {
      const stream = this.video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        this.video.srcObject = null;
      }
      this.cameraReady = false; // <-- Lo ocultas otra vez
    }


  async terminateWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
    }
  }
}