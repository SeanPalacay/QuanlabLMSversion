import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LessoncontentsComponent } from './lessoncontents.component';

describe('LessoncontentsComponent', () => {
  let component: LessoncontentsComponent;
  let fixture: ComponentFixture<LessoncontentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LessoncontentsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LessoncontentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
