import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DniScannerPage } from './dni-scanner.page';

describe('DniScannerPage', () => {
  let component: DniScannerPage;
  let fixture: ComponentFixture<DniScannerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DniScannerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
