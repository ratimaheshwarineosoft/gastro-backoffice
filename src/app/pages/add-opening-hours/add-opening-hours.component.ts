import { AfterViewInit, Component } from '@angular/core';
import { DayOpeningHours, AddOpeningHoursService } from './services/add-opening-hours.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import dayjs from 'dayjs';

interface DayOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-add-opening-hours',
  standalone: false,
  templateUrl: './add-opening-hours.component.html',
  styleUrl: './add-opening-hours.component.scss',
})
export class AddOpeningHoursComponent {
  openingHours: DayOpeningHours[] = [];
  isLoading = true;
  today = new Date();
  maxDate: Date;
  timeSeriesDate: { start: Date; end: Date };
  selectedPreset: string = '30'; // default active button
  dateRangeForm: FormGroup;
  finalTimeSeries: any[] = []; // fetched from API
  defaultFromDate!: string;
  defaultToDate!: string;
  showFilter = false;
  specialHoursForm: FormGroup;
  error: any = '';
  currentYear = new Date().getFullYear();
  isModalOpen = false;

  daysOfWeekOptions: DayOption[] = [
    { label: 'Monday', value: 1 },
    { label: 'Tuesday', value: 2 },
    { label: 'Wednesday', value: 3 },
    { label: 'Thursday', value: 4 },
    { label: 'Friday', value: 5 },
    { label: 'Saturday', value: 6 },
    { label: 'Sunday', value: 0 },
  ];

  datepickerConfig: any = {
    range: true,
    autoHide: true,
    format: 'dd/mm/yyyy',
    todayHighlight: true,
    clearBtn: true,
  };

  constructor(
    private AddOpeningHoursService: AddOpeningHoursService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit() {
    this.specialHoursForm = this.fb.group({
      entries: this.fb.array([this.createEntry()]),
    });
  }

  get entries(): FormArray {
    return this.specialHoursForm.get('entries') as FormArray;
  }

  createEntry(): FormGroup {
    return this.fb.group({
      fromDate: [''],
      fromYear: [''],
      toDate: [''],
      toYear: [''],
      reasonText: [''],
      daysOfWeek: this.fb.array([], Validators.required),
      isClosed: [false],
      timeRanges: this.fb.array([this.createTimeRange()]),
    });
  }

  createTimeRange(): FormGroup {
    return this.fb.group({ fromTime: ['', Validators.required], toTime: ['', Validators.required] });
  }

  addEntry() {
    this.entries.push(this.createEntry());
  }

  removeEntry(index: number) {
    this.entries.removeAt(index);
  }

  addTimeRange(entryIndex: number) {
    const timeRanges = this.entries.at(entryIndex).get('timeRanges') as FormArray;
    timeRanges.push(this.createTimeRange());
  }

  removeTimeRange(entryIndex: number, rangeIndex: number) {
    const timeRanges = this.entries.at(entryIndex).get('timeRanges') as FormArray;
    timeRanges.removeAt(rangeIndex);
  }

  onDayToggle(entryIndex: number, dayValue: number, checked: boolean) {
    const daysArray = this.entries.at(entryIndex).get('daysOfWeek') as FormArray;

    if (checked) {
      daysArray.push(new FormControl(dayValue));
    } else {
      const idx = daysArray.controls.findIndex((c) => c.value === dayValue);
      if (idx > -1) daysArray.removeAt(idx);
    }
  }

  onClosedToggle(entryIndex: number) {
    const entry = this.entries.at(entryIndex);
    const timeRanges = entry.get('timeRanges') as FormArray;
    const isClosed = entry.get('isClosed')?.value;

    if (isClosed) {
      // Set all time ranges to 00:00
      timeRanges.controls.forEach((tr) => {
        tr.get('fromTime')?.setValue('00:00');
        tr.get('toTime')?.setValue('00:00');
      });
    }
  }

  save() {
    console.log('save');
    if (!this.specialHoursForm.valid) {
      this.error = 'Mandatory Required Fields';
      console.log(this.error);
      return;
    }
    const clientId = this.route.snapshot.paramMap.get('clientId');

    const payload = this.entries.value.map((entry: any) => ({
      clientId: clientId,
      ...entry,
    }));

    this.AddOpeningHoursService.saveOpeningHours(+clientId, payload).subscribe({
      next: (res) => {
        console.log('Saved successfully', res);
        this.router.navigate(['/client', clientId, 'opening-hours']);
      },
      error: (err) => console.error(err),
    });
  }
  // Check if a day is selected in the given entry
  isDaySelected(entryIndex: number, dayValue: number): boolean {
    const entry = this.entries.at(entryIndex);
    const daysArray = entry.get('daysOfWeek') as FormArray;
    return daysArray.value.includes(dayValue);
  }

  // Check if a day should be disabled (already selected in another entry)
  isDayDisabledForEntry(entryIndex: number, dayValue: number): boolean {
    const entry = this.entries.at(entryIndex);
    const selectedDays: number[] = [];

    // Collect all selected days from all entries
    this.entries.controls.forEach((e) => {
      (e.get('daysOfWeek') as FormArray).value.forEach((d: number) => selectedDays.push(d));
    });

    const currentEntryDays = (entry.get('daysOfWeek') as FormArray).value;
    return selectedDays.includes(dayValue) && !currentEntryDays.includes(dayValue);
  }
  onDateBlur(event: any, formField: string) {
    let value: string = event.target.value;

    // Remove non-digit characters
    value = value.replace(/\D/g, '');

    // Must have at least day and month
    if (value.length < 4) return;

    let day = parseInt(value.slice(0, 2), 10);
    let month = parseInt(value.slice(2, 4), 10);

    if (month === 0) month = 1;
    // Cap month to 12
    if (month > 12) month = 12;

    // Get last day of the month (handles leap years)
    const year = new Date().getFullYear(); // assume current year
    const lastDay = new Date(year, month, 0).getDate(); // day 0 = last day of previous month

    // Cap day to lastDay
    if (day > lastDay) day = lastDay;

    // Format as DD/MM
    const formatted = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;

    // Update input and form control
    event.target.value = formatted;
    this.specialHoursForm.get(formField)?.setValue(formatted, { emitEvent: false });
  }

  onYearChange(entryIndex: number, controlName: string): void {
    const entry = this.entries.at(entryIndex);
    const control = entry.get(controlName);

    if (!control) return;

    const value = Number(control.value);
    const currentYear = new Date().getFullYear();

    if (value && value < currentYear) {
      control.setValue(currentYear);
    }
  }
}
