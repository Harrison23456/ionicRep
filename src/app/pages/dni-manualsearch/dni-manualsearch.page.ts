import { Component, OnInit } from '@angular/core';
import { DnisearchService } from 'src/app/services/dnisearch.service';

@Component({
  selector: 'app-dni-manualsearch',
  templateUrl: './dni-manualsearch.page.html',
  styleUrls: ['./dni-manualsearch.page.scss'],
})
export class DniManualsearchPage implements OnInit {


  ngOnInit() {
  }
  dni: string = '';
  result: any = null;
  errorMessage: string = '';

  constructor(private dniService: DnisearchService) {}

  searchDni() {
    if (!this.dni || this.dni.length !== 8) {
      this.errorMessage = 'Por favor, ingrese un DNI válido de 8 dígitos.';
      return;
    }

    this.dniService.getDniData(this.dni).subscribe({
      next: (data) => {
        this.result = data; // Guardar el resultado
        this.errorMessage = ''; // Limpiar mensajes de error
      },
      error: (error) => {
        this.result = null; // Limpiar resultado anterior
        this.errorMessage = error.message || 'Error al buscar el DNI.';
      },
    });
  }
}
