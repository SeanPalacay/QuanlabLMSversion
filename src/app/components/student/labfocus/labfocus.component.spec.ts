import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabfocusComponent } from './labfocus.component';

describe('LabfocusComponent', () => {
  let component: LabfocusComponent;
  let fixture: ComponentFixture<LabfocusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabfocusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabfocusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
