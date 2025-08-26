import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface DaySchedule {
  dayOrder: string;
  classes: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/data';

  getTimetable(): Observable<DaySchedule[]> {
    // You no longer need to get the cookie from localStorage or create headers manually.
    // HttpClient will handle it automatically with the new option.

    return this.http.get<DaySchedule[]>(`${this.apiUrl}/timetable`, { 
        withCredentials: true // <-- ADD THIS LINE
    });
}
}