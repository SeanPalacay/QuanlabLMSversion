import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveBarComponent } from './active-bar.component';

describe('ActiveBarComponent', () => {
  let component: ActiveBarComponent;
  let fixture: ComponentFixture<ActiveBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
