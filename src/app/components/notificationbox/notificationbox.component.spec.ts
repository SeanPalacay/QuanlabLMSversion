import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationboxComponent } from './notificationbox.component';

describe('NotificationboxComponent', () => {
  let component: NotificationboxComponent;
  let fixture: ComponentFixture<NotificationboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NotificationboxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
