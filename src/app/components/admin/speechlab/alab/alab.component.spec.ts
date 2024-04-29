import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlabComponent } from './alab.component';

describe('AlabComponent', () => {
  let component: AlabComponent;
  let fixture: ComponentFixture<AlabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
