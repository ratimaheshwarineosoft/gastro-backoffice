import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CheckInListComponent } from './check-in-list.component';

describe('CheckInListComponent', () => {
  let component: CheckInListComponent;
  let fixture: ComponentFixture<CheckInListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CheckInListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckInListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
