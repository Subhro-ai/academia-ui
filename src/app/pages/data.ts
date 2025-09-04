import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DaySchedule {
  dayOrder: string;
  classes: any[];
}

export interface TotalAttendance {
  totalAttendancePercentage: number;
}


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/data';

  getTimetable(): Observable<DaySchedule[]> {
    const sessionCookie = localStorage.getItem('sessionCookie');

    if (!sessionCookie) {
      throw new Error('Session token not found in localStorage.');
    }

    // Create headers and add the token to a custom header
    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);

    // Make the request with the custom headers and remove withCredentials
    return this.http.get<DaySchedule[]>(`${this.apiUrl}/timetable`, { headers });
  }

  getTotalAttendance(): Observable<TotalAttendance> {
    const sessionCookie = localStorage.getItem('sessionCookie');

    if (!sessionCookie) {
        throw new Error('Session token not found in localStorage.');
    }

    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    return this.http.get<TotalAttendance>(`${this.apiUrl}/total-attendance`, { headers });

  }
}