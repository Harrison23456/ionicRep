import { TestBed } from '@angular/core/testing';

import { DniScannerService } from './dni-scanner.service';

describe('DniScannerService', () => {
  let service: DniScannerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DniScannerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
