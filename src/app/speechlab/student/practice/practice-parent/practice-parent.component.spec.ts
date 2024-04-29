import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeParentComponent } from './practice-parent.component';

describe('PracticeParentComponent', () => {
  let component: PracticeParentComponent;
  let fixture: ComponentFixture<PracticeParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PracticeParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PracticeParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
