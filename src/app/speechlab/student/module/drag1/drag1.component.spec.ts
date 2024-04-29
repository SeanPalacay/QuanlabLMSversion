import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Drag1Component } from './drag1.component';

describe('Drag1Component', () => {
  let component: Drag1Component;
  let fixture: ComponentFixture<Drag1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Drag1Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Drag1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
