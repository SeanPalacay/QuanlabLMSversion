import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TlabComponent } from './tlab.component';

describe('TlabComponent', () => {
  let component: TlabComponent;
  let fixture: ComponentFixture<TlabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TlabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TlabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
