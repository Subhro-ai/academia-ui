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

export interface AttendanceDetail {
  courseCode: string;
  courseTitle: string;
  courseCategory: string;
  courseFaculty: string;
  courseSlot: string;
  courseAttendance: string;
  courseConducted: number;
  courseAbsent: number;
}

export interface mark {
  exam: string;
  obtained: number;
  maxMark: number;
  isPresent: boolean;
}

export interface MarksDetail {
  course: string;
  category: string;
  marks: mark[];
}

export interface UserInfo {
  regNumber: string;
  name: string;
  mobile: string;
  section: string;
  program: string;
  department: string;
  semester: string;
  batch: string;
}
export interface DayEvent {
  date: string;
  day: string;
  event: string;
  dayOrder: string;
}

export interface Month {
  month: string;
  days: DayEvent[];
}

export interface AllData {
  attendance: AttendanceDetail[];
  marks: MarksDetail[];
  timetable: DaySchedule[];
  calendar: Month[];
  userInfo: UserInfo;
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

  getAttendance(): Observable<AttendanceDetail[]> {
    const sessionCookie = localStorage.getItem('sessionCookie');

    if (!sessionCookie) {
      throw new Error('Session token not found in localStorage.');
    }

    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    return this.http.get<AttendanceDetail[]>(`${this.apiUrl}/attendance`, { headers });
  } 
  getMarks(): Observable<MarksDetail[]> {
    const sessionCookie = localStorage.getItem('sessionCookie');

    if (!sessionCookie) {
      throw new Error('Session token not found in localStorage.');
    }

    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    return this.http.get<MarksDetail[]>(`${this.apiUrl}/marks`, { headers });
  }

  getTotalMarks(MarksDetail : MarksDetail[]): number[] {
    let totalObtained = 0;
    let max = 0;
    
    for (let detail of MarksDetail) {
      for (let mark of detail.marks) {
        totalObtained += mark.obtained;
        max += mark.maxMark;
      }
    }
    return [totalObtained, max];
  }

  getUserInfo(): Observable<UserInfo> {
    const sessionCookie = localStorage.getItem('sessionCookie');

    if (!sessionCookie) {
      throw new Error('Session token not found in localStorage.');
    }

    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    return this.http.get<UserInfo>(`${this.apiUrl}/user-info`, { headers });
  }

  getCalendar(): Observable<Month[]> {
    const sessionCookie = localStorage.getItem('sessionCookie');
    if (!sessionCookie) {
      throw new Error('Session token not found in localStorage.');
    }
    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    return this.http.get<Month[]>(`${this.apiUrl}/calendar`, { headers });
  }

  getAllData(): Observable<AllData> {
    const sessionCookie = localStorage.getItem('sessionCookie');
    if (!sessionCookie) {
      throw new Error('Session token not found in localStorage.');
    }
    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    return this.http.get<AllData>(`${this.apiUrl}/all`, { headers });
  }
}