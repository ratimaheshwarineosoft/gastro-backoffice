import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationSettingsComponent } from './reservation-settings.component';

describe('ReservationSettingsComponent', () => {
  let component: ReservationSettingsComponent;
  let fixture: ComponentFixture<ReservationSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationSettingsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
