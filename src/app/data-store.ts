import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, tap } from 'rxjs';
import { DataService, AttendanceDetail, MarksDetail, DaySchedule, Month, UserInfo, AllData } from './pages/data';


@Injectable({
  providedIn: 'root'
})
export class DataStoreService {
  private dataService = inject(DataService);

  // Private BehaviorSubjects to hold the state
  private readonly _attendance = new BehaviorSubject<AttendanceDetail[]>([]);
  private readonly _marks = new BehaviorSubject<MarksDetail[]>([]);
  private readonly _timetable = new BehaviorSubject<DaySchedule[]>([]);
  private readonly _calendar = new BehaviorSubject<Month[]>([]);
  private readonly _userInfo = new BehaviorSubject<UserInfo | null>(null);
  private readonly _isLoading = new BehaviorSubject<boolean>(false);

  // Public observables for components to subscribe to
  readonly attendance$ = this._attendance.asObservable();
  readonly marks$ = this._marks.asObservable();
  readonly timetable$ = this._timetable.asObservable();
  readonly calendar$ = this._calendar.asObservable();
  readonly userInfo$ = this._userInfo.asObservable();
  readonly isLoading$ = this._isLoading.asObservable();

  fetchAllData(): Observable<AllData> {
    this._isLoading.next(true);
    return this.dataService.getAllData().pipe(
      tap(data => {
        this._attendance.next(data.attendance);
        this._marks.next(data.marks);
        this._timetable.next(data.timetable);
        this._calendar.next(data.calendar);
        this._userInfo.next(data.userInfo);
        this._isLoading.next(false);
      })
    );
  }
}
