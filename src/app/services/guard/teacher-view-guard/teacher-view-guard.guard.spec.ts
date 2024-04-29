import { TestBed } from '@angular/core/testing';

import { TeacherViewGuardGuard } from './teacher-view-guard.guard';

describe('TeacherViewGuardGuard', () => {
  let guard: TeacherViewGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TeacherViewGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
