import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizWritingComponent } from './quiz-writing.component';

describe('QuizWritingComponent', () => {
  let component: QuizWritingComponent;
  let fixture: ComponentFixture<QuizWritingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizWritingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizWritingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
