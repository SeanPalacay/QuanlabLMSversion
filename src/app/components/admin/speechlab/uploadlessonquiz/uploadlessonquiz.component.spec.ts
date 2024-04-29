import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadlessonquizComponent } from './uploadlessonquiz.component';

describe('UploadlessonquizComponent', () => {
  let component: UploadlessonquizComponent;
  let fixture: ComponentFixture<UploadlessonquizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UploadlessonquizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadlessonquizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
