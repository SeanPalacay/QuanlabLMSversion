import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoZoomComponent } from './video-zoom.component';

describe('VideoZoomComponent', () => {
  let component: VideoZoomComponent;
  let fixture: ComponentFixture<VideoZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoZoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideoZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
