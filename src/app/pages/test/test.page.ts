import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {


  ngOnInit() {
  }
  message: string = '';  // Para almacenar la respuesta del servidor

  constructor(private http: HttpClient) {}

  conectar() {
    // Realiza una solicitud GET al backend
    this.http.get('https://192.168.30.21:3000/api/mobileroute/conectar', { responseType: 'text' })
      .subscribe(response => {
        this.message = response;
      }, error => {
        console.error('Error al conectar', error);
        this.message = 'Error al conectar al servidor.';
      });
  }
}
