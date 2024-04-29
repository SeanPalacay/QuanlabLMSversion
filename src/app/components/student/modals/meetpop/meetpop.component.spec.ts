import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetpopComponent } from './meetpop.component';

describe('MeetpopComponent', () => {
  let component: MeetpopComponent;
  let fixture: ComponentFixture<MeetpopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeetpopComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetpopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
