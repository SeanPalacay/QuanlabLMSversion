import { TestBed } from '@angular/core/testing';

import { PortalGuard } from './portal.guard';

describe('PortalGuard', () => {
  let guard: PortalGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(PortalGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
