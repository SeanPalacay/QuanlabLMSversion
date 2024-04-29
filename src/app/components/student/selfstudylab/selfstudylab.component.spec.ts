import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfstudylabComponent } from './selfstudylab.component';

describe('SelfstudylabComponent', () => {
  let component: SelfstudylabComponent;
  let fixture: ComponentFixture<SelfstudylabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfstudylabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelfstudylabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
