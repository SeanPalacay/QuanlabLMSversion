import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabVidsComponent } from './lab-vids.component';

describe('LabVidsComponent', () => {
  let component: LabVidsComponent;
  let fixture: ComponentFixture<LabVidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabVidsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabVidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
