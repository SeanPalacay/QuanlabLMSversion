import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrillsComponent } from './drills.component';

describe('DrillsComponent', () => {
  let component: DrillsComponent;
  let fixture: ComponentFixture<DrillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DrillsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
