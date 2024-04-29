import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabContainerComponent } from './lab-container.component';

describe('LabContainerComponent', () => {
  let component: LabContainerComponent;
  let fixture: ComponentFixture<LabContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
