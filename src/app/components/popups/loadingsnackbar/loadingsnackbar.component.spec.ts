import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSnackbarComponent } from './loadingsnackbar.component';

describe('LoadingSnackbarComponent', () => {
  let component: LoadingSnackbarComponent;
  let fixture: ComponentFixture<LoadingSnackbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadingSnackbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadingSnackbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
