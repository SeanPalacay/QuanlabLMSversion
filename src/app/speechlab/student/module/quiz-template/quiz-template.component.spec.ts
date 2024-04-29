import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizTemplateComponent } from './quiz-template.component';

describe('QuizTemplateComponent', () => {
  let component: QuizTemplateComponent;
  let fixture: ComponentFixture<QuizTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuizTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuizTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
