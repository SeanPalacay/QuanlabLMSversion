import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderzComponent } from './headerz.component';

describe('HeaderzComponent', () => {
  let component: HeaderzComponent;
  let fixture: ComponentFixture<HeaderzComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderzComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
