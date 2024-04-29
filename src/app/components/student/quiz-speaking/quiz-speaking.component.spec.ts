import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizSpeakingComponent } from './quiz-speaking.component';

describe('QuizSpeakingComponent', () => {
  let component: QuizSpeakingComponent;
  let fixture: ComponentFixture<QuizSpeakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizSpeakingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizSpeakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
