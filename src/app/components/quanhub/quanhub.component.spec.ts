import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuanhubComponent } from './quanhub.component';

describe('QuanhubComponent', () => {
  let component: QuanhubComponent;
  let fixture: ComponentFixture<QuanhubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuanhubComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuanhubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
