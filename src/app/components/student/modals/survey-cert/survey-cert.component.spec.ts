import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyCertComponent } from './survey-cert.component';

describe('SurveyCertComponent', () => {
  let component: SurveyCertComponent;
  let fixture: ComponentFixture<SurveyCertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SurveyCertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyCertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
