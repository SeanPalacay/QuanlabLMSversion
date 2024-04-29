import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizAnalyticsComponent } from './quiz-analytics.component';

describe('QuizAnalyticsComponent', () => {
  let component: QuizAnalyticsComponent;
  let fixture: ComponentFixture<QuizAnalyticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizAnalyticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
