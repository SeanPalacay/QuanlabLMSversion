import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThomeComponent } from './thome.component';

describe('ThomeComponent', () => {
  let component: ThomeComponent;
  let fixture: ComponentFixture<ThomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
