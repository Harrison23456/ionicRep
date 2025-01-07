import { Component, OnInit } from '@angular/core';
import { Device } from '@capacitor/device';
import { Plugins } from '@capacitor/core';

const { AndroidId } = Plugins;
@Component({
  selector: 'app-imei',
  templateUrl: './imei.page.html',
  styleUrls: ['./imei.page.scss'],
})
export class ImeiPage implements OnInit {
  androidId: string | null = null;
  errorMessage: string | null = null;

  ngOnInit(): void {}

  constructor() {}

  async getAndroidId() {
    try {
      const result = await AndroidId['getAndroidId']();
      console.log('Android ID:', result.androidId);
      this.androidId = result.androidId;
      this.errorMessage = null; // Limpiamos el mensaje de error si la solicitud es exitosa
    } catch (error) {
      console.error('Error getting Android ID', error);
      this.errorMessage = 'No se pudo obtener el Android ID.';
      this.androidId = null; // Limpiamos el Android ID si hay un error
    }
  }
}