import { TestBed } from '@angular/core/testing';

import { AddOpeningHoursService } from './add-opening-hours.service';

describe('OpeningHoursService', () => {
  let service: AddOpeningHoursService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddOpeningHoursService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
