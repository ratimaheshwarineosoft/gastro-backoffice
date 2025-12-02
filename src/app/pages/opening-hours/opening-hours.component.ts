import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { DayOpeningHours, OpeningHoursService } from './services/opening-hours.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import dayjs from 'dayjs';
import { CalendarService } from '@app/calendar.service';

interface DayOption {
  label: string;
  value: number;
}

declare var HsDatepicker: any;
@Component({
  selector: 'app-opening-hours',
  standalone: false,
  templateUrl: './opening-hours.component.html',
  styleUrl: './opening-hours.component.scss',
})
export class OpeningHoursComponent implements AfterViewInit {
  openingHours: DayOpeningHours[] = [];
  specialOpeningHours: DayOpeningHours[] = [];
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
  viewForm!: FormGroup;

  editData: any; // comes from parent
  specialForm!: FormGroup;

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
    private cs: CalendarService,
  ) {}
  anchor = signal(new Date());
  grid = signal<any[]>([]);
  events: any[] = [];

  // local modal state
  showCreate = signal(false);
  showEdit = signal(false);
  openings = signal<any[]>([]);

  selectedDate = signal<Date | null>(null);
  editingEvent = signal<any | null>(null);
  weeks: any[][] = [];
  ngOnInit(): void {
    this.cs.current$.subscribe((d) => {
      this.anchor.set(d);
      this.rebuild();
    });
    this.cs.events$.subscribe((ev) => {
      this.events = ev;
      this.rebuild();
    });

    this.rebuild();
    const today = new Date();
    const toDate = new Date(today);
    toDate.setDate(today.getDate() + 30);
    this.loadOpeningHours(this.formatDate(today), this.formatDate(toDate));
    this.loadSpecialOpeningHours();
    this.dateRangeForm = this.fb.group({
      dateRange: [{ startDate: today, endDate: toDate, label: 'Next 30 Days' }],
    });
    this.viewForm = this.fb.group({
      isCalendar: [false],
    });
    this.specialForm = this.fb.group({
      clientId: [null],
      fromDate: [{ value: '', disabled: true }, Validators.required],
      toDate: [{ value: '', disabled: true }, Validators.required],
      fromYear: [{ value: '', disabled: true }],
      toYear: [{ value: '', disabled: true }],
      reasonText: [''],
      timeRanges: this.fb.array([]),
    });

    if (this.editData) {
      this.patchForm(this.editData);
    }

    this.dateRangeForm.get('dateRange')?.valueChanges.subscribe((value) => {
      console.log(value, 'Valye Chane');
      if (value && value.includes(' - ')) {
        // ensure range is complete
        const [fromDate, toDate] = value.split(' - ');

        console.log('From:', fromDate, 'To:', toDate);

        this.selectedPreset = 'custom';
        this.onDateRangeChange({ fromDate, toDate }); // call your API
      }
    });
    this.specialHoursForm = this.fb.group({
      entries: this.fb.array([]),
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      (window as any).HSStaticMethods?.autoInit();
      console.log('HSDatepicker plugin:', (window as any).HSDatepicker);
    }, 0);

    const inputEl = document.querySelector<HTMLInputElement>('.hs-datepicker');
    if (inputEl) {
      inputEl.addEventListener('change', () => {
        const value = inputEl.value; // e.g. "2025-09-29 / 2025-10-29"

        if (value) {
          const [start, end] = value.split('/').map((v) => v.trim());
          this.dateRangeForm.get('dateRange')?.setValue({
            startDate: start ? new Date(start) : null,
            endDate: end ? new Date(end) : null,
            label: undefined,
          });
        } else {
          this.dateRangeForm.get('dateRange')?.setValue({ startDate: null, endDate: null });
        }
      });

      const initial = this.dateRangeForm.get('dateRange')?.value;
      if (initial?.startDate && initial?.endDate) {
        inputEl.value = `${this.formatDate(new Date(initial.startDate))} - ${this.formatDate(new Date(initial.endDate))}`;
      }
    }
  }

  setView(isCalendar: boolean) {
    this.viewForm.get('isCalendar')?.setValue(isCalendar);
  }

  private formatDate(date: any): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Jan = 0
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  setPreset(days: number): void {
    this.selectedPreset = days.toString();
    const fromDate = dayjs().format('DD/MM/YYYY');
    const toDate = dayjs().add(days, 'day').format('DD/MM/YYYY');
    console.log(fromDate, toDate);
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);

    const inputEl = document.querySelector<HTMLInputElement>('.hs-datepicker');
    const initial = this.dateRangeForm.get('dateRange')?.value;
    if (initial?.startDate && initial?.endDate) {
      inputEl.value = `${this.formatDate(new Date(start))} - ${this.formatDate(new Date(end))}`;
    }

    this.loadOpeningHours(fromDate, toDate);
  }

  loadOpeningHours(fromDate: string, toDate: string) {
    this.isLoading = true;
    const clientId = this.route.snapshot.paramMap.get('clientId');

    this.openingHoursService.getOpeningHours(+clientId, { fromDate, toDate }).subscribe({
      next: (data) => {
        this.openingHours = data;
        this.openings.set(data);
        this.rebuild();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching opening hours', err);
        this.isLoading = false;
      },
    });
  }

  loadSpecialOpeningHours() {
    this.isLoading = true;
    const clientId = this.route.snapshot.paramMap.get('clientId');

    this.openingHoursService.getSpecialOpeningHours(+clientId).subscribe({
      next: (data) => {
        this.specialOpeningHours = data['results'];
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

  editResTime(data: any) {
    this.editData = data;
    console.log(data);
    this.patchForm(data);
    (window as any).HSOverlay.open('#editSpecialModal');
  }

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

  redirectOnForm() {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    this.router.navigate(['/client', clientId, 'add-opening-hours']);
  }

  get timeRanges(): FormArray {
    return this.specialForm.get('timeRanges') as FormArray;
  }

  addSpecialTimeRange(range?: any) {
    const group = this.fb.group({
      fromTime: [range?.fromTime || '', Validators.required],
      toTime: [range?.toTime || '', Validators.required],
    });
    this.timeRanges.push(group);
  }

  removeSpecialTimeRange(index: number) {
    this.timeRanges.removeAt(index);
  }

  patchForm(data: any) {
    this.specialForm.patchValue({
      clientId: data.clientId,
      fromDate: data.date.slice(0, 5),
      toDate: data.date.slice(0, 5),
      fromYear: data.date.slice(6, 10),
      toYear: data.date.slice(6, 10),
      reasonText: data.reasonText,
    });
    this.timeRanges.clear();
    data.openingHours.forEach((r: any) => this.addSpecialTimeRange(r));
  }

  onSpecialHoursSubmit() {
    if (this.specialForm.invalid) return;
    const clientId = this.route.snapshot.paramMap.get('clientId');
    console.log(this.specialForm.value, this.specialForm.getRawValue());
    const payload = {
      ...this.specialForm.getRawValue(),
      clientId: clientId,
    };
    console.log(payload);
    this.openingHoursService.saveOpeningHours(+clientId, payload).subscribe({
      next: (res) => {
        console.log('Saved successfully:', res);
        // close modal (Preline)
        this.setPreset(30);
        this.loadSpecialOpeningHours();
        (window as any).HSOverlay.close('#editSpecialModal');
      },
      error: (err) => {
        console.error('Error saving:', err);
      },
    });
  }

  closeModal() {
    (window as any).HSOverlay.close('#editSpecialModal');
  }

  deleteResTime(id: any) {
    const clientId = this.route.snapshot.paramMap.get('clientId');
    const payload = {
      clientId: clientId,
      id: id,
      isSpecial: true,
    };
    this.openingHoursService.deleteOpeningHours(+clientId, payload).subscribe({
      next: (res) => {
        console.log('Saved successfully:', res);
        this.setPreset(30);
        this.loadSpecialOpeningHours();
        (window as any).HSOverlay.close('#editSpecialModal');
      },
      error: (err) => {
        console.error('Error saving:', err);
      },
    });
  }

  rebuild() {
    const cells = this.cs.buildMonthGrid(this.anchor(), this.events);

    // ✅ Convert 42 cells into 6 weeks of 7 days each
    this.weeks = [];
    for (let i = 0; i < 42; i += 7) {
      this.weeks.push(cells.slice(i, i + 7));
    }

    this.grid.set(cells);
  }

  loadCalendarOpeningHours() {
    console.log(this.cs.buildMonthGrid(this.anchor(), []).at(0)?.date);
    const fromDate = this.formatDate(new Date(this.cs.buildMonthGrid(this.anchor(), []).at(0)?.date) ?? new Date());
    const toDate = this.formatDate(new Date(this.cs.buildMonthGrid(this.anchor(), []).at(-1)?.date) ?? new Date());
    const clientId = this.route.snapshot.paramMap.get('clientId');

    this.openingHoursService.getOpeningHours(+clientId, { fromDate, toDate }).subscribe({
      next: (data) => {
        this.openings.set(data);
        this.rebuild();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching opening hours', err);
        this.isLoading = false;
      },
    });
  }

  getOpeningsFor(cell: any) {
    const key = this.formatDate(cell.date);
    return this.openings().find((o) => o.date === key)?.openingHours ?? [];
  }
  // existing functions (or add them)
  prev() {
    this.cs.prevMonth();
    this.loadCalendarOpeningHours();
  }
  next() {
    this.cs.nextMonth();
    this.loadCalendarOpeningHours();
  }
  goToday() {
    this.cs.today();
    this.loadCalendarOpeningHours();
  }

  openCreate(date: Date) {
    console.log('Create new event on', date);
  }
  onEventClick(e: any) {
    console.log('Edit event', e);
  }

  trackByIndex(i: number) {
    return i;
  }
}
