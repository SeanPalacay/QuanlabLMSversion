import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TlessonsComponent } from './tlessons.component';

describe('TlessonsComponent', () => {
  let component: TlessonsComponent;
  let fixture: ComponentFixture<TlessonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TlessonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TlessonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
