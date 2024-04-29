import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Drag2Component } from './drag2.component';

describe('Drag2Component', () => {
  let component: Drag2Component;
  let fixture: ComponentFixture<Drag2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Drag2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Drag2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
