import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabLaptopComponent } from './lab-laptop.component';

describe('LabLaptopComponent', () => {
  let component: LabLaptopComponent;
  let fixture: ComponentFixture<LabLaptopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabLaptopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabLaptopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
