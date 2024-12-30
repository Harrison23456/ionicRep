import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DniIdentificationPage } from './dni-identification.page';

describe('DniIdentificationPage', () => {
  let component: DniIdentificationPage;
  let fixture: ComponentFixture<DniIdentificationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DniIdentificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
