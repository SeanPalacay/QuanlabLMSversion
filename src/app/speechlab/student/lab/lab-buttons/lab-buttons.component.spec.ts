import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabButtonsComponent } from './lab-buttons.component';

describe('LabButtonsComponent', () => {
  let component: LabButtonsComponent;
  let fixture: ComponentFixture<LabButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
