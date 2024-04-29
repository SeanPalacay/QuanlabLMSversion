import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsdashboardComponent } from './tsdashboard.component';

describe('TsdashboardComponent', () => {
  let component: TsdashboardComponent;
  let fixture: ComponentFixture<TsdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TsdashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TsdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
