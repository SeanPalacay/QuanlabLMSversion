import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModulePlaceholderComponent } from './module-placeholder.component';

describe('ModulePlaceholderComponent', () => {
  let component: ModulePlaceholderComponent;
  let fixture: ComponentFixture<ModulePlaceholderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModulePlaceholderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModulePlaceholderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
