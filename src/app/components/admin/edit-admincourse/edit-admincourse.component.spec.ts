import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAdmincourseComponent } from './edit-admincourse.component';

describe('EditAdmincourseComponent', () => {
  let component: EditAdmincourseComponent;
  let fixture: ComponentFixture<EditAdmincourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAdmincourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAdmincourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
