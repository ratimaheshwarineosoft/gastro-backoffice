import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationStatisticsComponent } from './reservation-statistics.component';

describe('ReservationStatisticsComponent', () => {
  let component: ReservationStatisticsComponent;
  let fixture: ComponentFixture<ReservationStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationStatisticsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
