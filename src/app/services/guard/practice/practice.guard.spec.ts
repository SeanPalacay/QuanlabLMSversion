import { TestBed } from '@angular/core/testing';

import { PracticeGuard } from './practice.guard';

describe('PracticeGuard', () => {
  let guard: PracticeGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PracticeGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
