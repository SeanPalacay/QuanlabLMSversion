import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCourseComponent } from './managecourse.component';

describe('LessonComponent', () => {
  let component: ManageCourseComponent;
  let fixture: ComponentFixture<ManageCourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
