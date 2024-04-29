import { TestBed } from '@angular/core/testing';

import { LoaderGuard } from './loader.guard';

describe('LoaderGuard', () => {
  let guard: LoaderGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(LoaderGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
