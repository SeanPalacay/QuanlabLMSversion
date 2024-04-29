import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleParentComponent } from './module-parent.component';

describe('ModuleParentComponent', () => {
  let component: ModuleParentComponent;
  let fixture: ComponentFixture<ModuleParentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModuleParentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleParentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
