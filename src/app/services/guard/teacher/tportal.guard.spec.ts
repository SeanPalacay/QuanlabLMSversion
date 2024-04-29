import { TestBed } from '@angular/core/testing';

import { TportalGuard } from './tportal.guard';

describe('TportalGuard', () => {
  let guard: TportalGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TportalGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
