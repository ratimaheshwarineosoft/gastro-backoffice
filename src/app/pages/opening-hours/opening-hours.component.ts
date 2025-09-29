import { AfterViewInit, Component } from '@angular/core';
import { DayOpeningHours, OpeningHoursService } from './services/opening-hours.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs';

interface DayOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-opening-hours',
  standalone: false,
  templateUrl: './opening-hours.component.html',
  styleUrl: './opening-hours.component.scss',
})
export class OpeningHoursComponent implements AfterViewInit {
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

  isModalOpen = false;

  daysOfWeekOptions: DayOption[] = [
    { label: 'Monday', value: 0 },
    { label: 'Tuesday', value: 1 },
    { label: 'Wednesday', value: 2 },
    { label: 'Thursday', value: 3 },
    { label: 'Friday', value: 4 },
    { label: 'Saturday', value: 5 },
    { label: 'Sunday', value: 6 },
  ];

  datepickerConfig: any = {
    range: true,
    autoHide: true,
    format: 'dd/mm/yyyy',
    todayHighlight: true,
    clearBtn: true,
  };

  constructor(
    private openingHoursService: OpeningHoursService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const today = new Date();
    const toDate = new Date(today);
    toDate.setDate(today.getDate() + 30);
    this.loadOpeningHours(this.formatDate(today), this.formatDate(toDate));

    this.dateRangeForm = this.fb.group({
      dateRange: [{ startDate: today, endDate: toDate, label: 'Next 30 Days' }],
    });
    this.dateRangeForm.get('dateRange')?.valueChanges.subscribe((value) => {
      const fromDate = value.startDate.format('DD/MM/YYYY');
      const toDate = value.endDate.format('DD/MM/YYYY');
      console.log('From:', fromDate, 'To:', toDate);
      this.selectedPreset = 'custom';
      this.onDateRangeChange({ fromDate, toDate });
    });
    this.specialHoursForm = this.fb.group({
      entries: this.fb.array([]),
    });
    this.addEntry();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      (window as any).HSStaticMethods?.autoInit();
      console.log('HSDatepicker plugin:', (window as any).HSDatepicker);
    }, 0);
  }
  private formatDate(date: any): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Jan = 0
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  setPreset(days: number): void {
    this.selectedPreset = days.toString();
    const fromDate = dayjs().format('DD/MM/YYYY');
    const toDate = dayjs().add(days, 'day').format('DD/MM/YYYY');
    console.log(fromDate, toDate);
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    this.dateRangeForm.patchValue({
      dateRange: { startDate: start, endDate: end, label: `Next ${this.selectedPreset} Days` },
    });
    this.loadOpeningHours(fromDate, toDate);
  }

  loadOpeningHours(fromDate: string, toDate: string) {
    this.isLoading = true;
    const clientId = this.route.snapshot.paramMap.get('clientId');

    this.openingHoursService.getOpeningHours(+clientId, { fromDate, toDate }).subscribe({
      next: (data) => {
        this.openingHours = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching opening hours', err);
        this.isLoading = false;
      },
    });
  }

  onDateRangeChange({ fromDate, toDate }: any) {
    this.loadOpeningHours(fromDate, toDate);
  }

  blockResTime(data: any) {}
  unBlockResTime(data: any) {}
  deleteResTime(data: any) {}
  editResTime(data: any) {}

  get entries(): FormArray {
    return this.specialHoursForm.get('entries') as FormArray;
  }

  get selectedDays(): number[] {
    const days = this.entries.controls
      .map((e) => e.get('daysOfWeek')?.value)
      .flat()
      .filter((d: number) => d !== null && d !== undefined);
    return [...new Set(days)]; // remove duplicates
  }

  addEntry() {
    const entry = this.fb.group({
      fromDate: ['', Validators.required],
      toDate: [''],
      fromYear: [new Date().getFullYear()],
      toYear: [new Date().getFullYear()],
      timeRanges: this.fb.array([this.createTimeRange()]),
      isSpecial: [true],
      reasonText: [''],
      daysOfWeek: [[], Validators.required],
      isClosed: [false],
    });
    this.entries.push(entry);
  }

  removeEntry(index: number) {
    this.entries.removeAt(index);
  }

  createTimeRange(): FormGroup {
    return this.fb.group({
      fromTime: ['', Validators.required],
      toTime: ['', Validators.required],
    });
  }

  addTimeRange(entryIndex: number) {
    const timeRanges = this.entries.at(entryIndex).get('timeRanges') as FormArray;
    timeRanges.push(this.createTimeRange());
  }

  removeTimeRange(entryIndex: number, rangeIndex: number) {
    const timeRanges = this.entries.at(entryIndex).get('timeRanges') as FormArray;
    timeRanges.removeAt(rangeIndex);
  }

  onClosedToggle(entryIndex: number) {
    const entry = this.entries.at(entryIndex);
    const isClosed = entry.get('isClosed')?.value;
    const timeRanges = entry.get('timeRanges') as FormArray;

    if (isClosed) {
      // Set all time ranges to 00:00
      timeRanges.controls.forEach((range) => {
        range.patchValue({ fromTime: '00:00', toTime: '00:00' });
      });
    } else {
      // Reset to empty times
      timeRanges.controls.forEach((range) => {
        range.patchValue({ fromTime: '', toTime: '' });
      });
    }
  }

  save() {
    if (this.specialHoursForm.invalid) return;
    const clientId = this.route.snapshot.paramMap.get('clientId');

    const payload = this.entries.value.map((entry: any) => ({
      clientId: clientId,
      ...entry,
    }));

    this.openingHoursService.saveOpeningHours(+clientId, payload).subscribe({
      next: (res) => {
        console.log('Saved successfully', res);
        this.closeModal();
        this.setPreset(30);
      },
      error: (err) => console.error(err),
    });
  }
  openModal() {
    console.log('modal');
    const modal = document.getElementById('specialHoursModal');
    if (modal) {
      const Preline = (window as any).Preline;
      Preline.Modal.getInstance(modal)?.show() || new Preline.Modal(modal).show();
    }
  }

  closeModal() {
    const modal = document.getElementById('specialHoursModal');
    if (modal) {
      const Preline = (window as any).Preline;
      Preline.Modal.getInstance(modal)?.hide();
    }
  }
  isDayDisabled(dayValue: number): boolean {
    return this.selectedDays.includes(dayValue);
  }
  redirectOnForm() {
    const clientId = this.route.snapshot.paramMap.get('clientId');

    this.router.navigate(['/client', clientId, 'add-opening-hours']);
  }
}
