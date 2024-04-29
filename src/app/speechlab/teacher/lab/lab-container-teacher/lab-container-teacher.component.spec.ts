import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabContainerTeacherComponent } from './lab-container-teacher.component';

describe('LabContainerTeacherComponent', () => {
  let component: LabContainerTeacherComponent;
  let fixture: ComponentFixture<LabContainerTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabContainerTeacherComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabContainerTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
