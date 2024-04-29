import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadDrillComponent } from './upload-drill.component';

describe('UploadDrillComponent', () => {
  let component: UploadDrillComponent;
  let fixture: ComponentFixture<UploadDrillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadDrillComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadDrillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
