import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DnisearchService } from 'src/app/services/dnisearch.service';
import { Plugins } from '@capacitor/core';
const { AndroidId } = Plugins;
declare var AnylineSDK: any;


@Component({
  selector: 'app-dni-identification',
  templateUrl: './dni-identification.page.html',
  styleUrls: ['./dni-identification.page.scss'],
})

export class DniIdentificationPage implements OnInit {
resultado: any = null;

  constructor(private api: DnisearchService) {}
  ngOnInit(): void {

  }


}