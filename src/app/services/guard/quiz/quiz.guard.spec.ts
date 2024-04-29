import { TestBed } from '@angular/core/testing';

import { QuizGuard } from './quiz.guard';

describe('QuizGuard', () => {
  let guard: QuizGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(QuizGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
