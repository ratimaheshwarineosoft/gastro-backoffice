import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationLogComponent } from './reservation-log.component';

describe('ReservationLogComponent', () => {
  let component: ReservationLogComponent;
  let fixture: ComponentFixture<ReservationLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReservationLogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
