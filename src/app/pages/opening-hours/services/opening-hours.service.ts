// src/app/services/opening-hours.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface OpeningPeriod {
  id: number;
  fromTime: string;
  toTime: string;
  isSpecial: boolean;
  reasonText: string;
  firstOpeningPeriod: string;
}

export interface DayOpeningHours {
  date: string;
  day: string;
  openingHours: OpeningPeriod[];
}

@Injectable({
  providedIn: 'root',
})
export class OpeningHoursService {
  constructor(private http: HttpClient) {}

  getOpeningHours(clientId: number, { fromDate, toDate }: any): Observable<DayOpeningHours[]> {
    return this.http.get<DayOpeningHours[]>(`${environment.serverUrl}v2/client/opening-hours/all/${clientId}?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`);
  }
  getSpecialOpeningHours(clientId: number): Observable<DayOpeningHours[]> {
    return this.http.get<DayOpeningHours[]>(`${environment.serverUrl}v2/client/opening-hours/special/${clientId}`);
  }
  saveOpeningHours(clientId: number, payload: any): Observable<any> {
    return this.http.post(`${environment.serverUrl}v2/client/opening-hours/save-special/${clientId}`, payload);
  }
  deleteOpeningHours(clientId: number, payload: any): Observable<any> {
    return this.http.post(`${environment.serverUrl}v2/client/special-opening-hours/delete/${clientId}`, payload);
  }
}
