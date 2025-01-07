import { TestBed } from '@angular/core/testing';

import { DnisearchService } from './dnisearch.service';

describe('DnisearchService', () => {
  let service: DnisearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DnisearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
