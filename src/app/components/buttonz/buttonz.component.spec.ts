import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonzComponent } from './buttonz.component';

describe('ButtonzComponent', () => {
  let component: ButtonzComponent;
  let fixture: ComponentFixture<ButtonzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ButtonzComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
