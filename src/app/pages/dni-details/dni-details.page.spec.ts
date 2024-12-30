import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DniDetailsPage } from './dni-details.page';

describe('DniDetailsPage', () => {
  let component: DniDetailsPage;
  let fixture: ComponentFixture<DniDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DniDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
