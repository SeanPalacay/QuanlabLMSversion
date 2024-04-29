import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAandDComponent } from './student-aand-d.component';

describe('StudentAandDComponent', () => {
  let component: StudentAandDComponent;
  let fixture: ComponentFixture<StudentAandDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentAandDComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAandDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
