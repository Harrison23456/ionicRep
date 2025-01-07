import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImeiPage } from './imei.page';

describe('ImeiPage', () => {
  let component: ImeiPage;
  let fixture: ComponentFixture<ImeiPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ImeiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
