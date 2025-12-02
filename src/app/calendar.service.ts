import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface DayCell {
  date: Date;
  inMonth: boolean;
  events: any[];
}

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private events = new BehaviorSubject<any[]>([]);
  events$ = this.events.asObservable();

  // Current month anchor
  private current = new BehaviorSubject<Date>(new Date());
  current$ = this.current.asObservable();

  setMonth(date: Date) {
    this.current.next(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  nextMonth() {
    console.log('next month');
    const d = this.current.value;
    this.setMonth(new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }
  prevMonth() {
    const d = this.current.value;
    this.setMonth(new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  today() {
    this.setMonth(new Date());
  }

  // events CRUD (in-memory)
  addEvent(ev: any) {
    const list = [...this.events.value, ev];
    this.events.next(list);
  }
  updateEvent(updated: any) {
    const list = this.events.value.map((e) => (e.id === updated.id ? updated : e));
    this.events.next(list);
  }
  deleteEvent(id: string) {
    const list = this.events.value.filter((e) => e.id !== id);
    this.events.next(list);
  }

  // Generate month grid: returns 6 weeks x 7 days
  buildMonthGrid(anchor: Date, events: any[]): DayCell[] {
    const year = anchor.getFullYear();
    const month = anchor.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    // weekday: Monday = 1, Sunday = 0 -> convert so week starts Mon
    const weekday = (firstOfMonth.getDay() + 6) % 7; // 0..6 where 0=Mon
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - weekday);

    const cells: DayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      const dateISO = d.toISOString().slice(0, 10);
      const dayEvents = events.filter((ev) => ev.start.slice(0, 10) === dateISO);

      cells.push({
        date: d,
        inMonth: d.getMonth() === month,
        events: dayEvents,
      });
    }
    return cells;
  }
}
