import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemreportComponent } from './problemreport.component';

describe('ProblemreportComponent', () => {
  let component: ProblemreportComponent;
  let fixture: ComponentFixture<ProblemreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProblemreportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProblemreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
