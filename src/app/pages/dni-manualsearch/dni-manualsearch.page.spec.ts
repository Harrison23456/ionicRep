import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DniManualsearchPage } from './dni-manualsearch.page';

describe('DniManualsearchPage', () => {
  let component: DniManualsearchPage;
  let fixture: ComponentFixture<DniManualsearchPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DniManualsearchPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
