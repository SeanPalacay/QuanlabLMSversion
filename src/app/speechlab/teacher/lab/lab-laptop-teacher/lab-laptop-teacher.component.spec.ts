import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabLaptopTeacherComponent } from './lab-laptop-teacher.component';

describe('LabLaptopTeacherComponent', () => {
  let component: LabLaptopTeacherComponent;
  let fixture: ComponentFixture<LabLaptopTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLaptopTeacherComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLaptopTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
