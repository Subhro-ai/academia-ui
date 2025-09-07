import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { DataService, Month, AttendanceDetail, DaySchedule, DayEvent } from '../pages/data';

/**
 * Interface to hold the combined data required for prediction calculations.
 */
export interface PredictionData {
  calendar: Month[];
  attendance: AttendanceDetail[];
  timetable: DaySchedule[];
}

/**
 * Extends AttendanceDetail to include predicted values.
 */
export interface PredictedAttendance extends AttendanceDetail {
  predictedConducted: number;
  predictedAbsent: number;
  predictedAttendance: string;
}

@Injectable({
  providedIn: 'root'
})
export class PredictionService {
  private dataService = inject(DataService);

  /**
   * Fetches all the necessary data for prediction in parallel.
   * @returns An observable that emits a single PredictionData object when all data is fetched.
   */
  getPredictionData(): Observable<PredictionData> {
    return forkJoin({
      calendar: this.dataService.getCalendar(),
      attendance: this.dataService.getAttendance(),
      timetable: this.dataService.getTimetable()
    }).pipe(
      map(data => {
        return data as PredictionData;
      })
    );
  }

  /**
   * Predicts attendance percentages, assuming perfect attendance until the leave starts,
   * and then absence during the leave period.
   * @param startDate The start date of the leave.
   * @param endDate The end date of the leave.
   * @param data The combined prediction data.
   * @returns An array of PredictedAttendance objects.
   */
  predictAttendanceOnLeave(startDate: Date, endDate: Date, data: PredictionData): PredictedAttendance[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate classes to be attended from today until the day before the leave starts.
    const attendedStartDate = new Date(today);
    const attendedEndDate = new Date(startDate);
    attendedEndDate.setDate(attendedEndDate.getDate() - 1);
    
    const futureAttendances = (attendedEndDate >= attendedStartDate) 
      ? this.calculateClassesInDateRange(attendedStartDate, attendedEndDate, data.calendar, data.timetable)
      : new Map<string, number>();

    // Calculate classes that will be missed during the leave period.
    const futureAbsences = this.calculateClassesInDateRange(startDate, endDate, data.calendar, data.timetable);
    
    const predictedAttendanceList = data.attendance.map(subject => {
      const additionalAttended = futureAttendances.get(subject.courseCode) || 0;
      const additionalAbsences = futureAbsences.get(subject.courseCode) || 0;
      
      const predictedConducted = subject.courseConducted + additionalAttended + additionalAbsences;
      const predictedAbsent = subject.courseAbsent + additionalAbsences;
      
      let predictedPercentage = 100;
      if (predictedConducted > 0) {
        predictedPercentage = ((predictedConducted - predictedAbsent) / predictedConducted) * 100;
      }

      return {
        ...subject,
        predictedConducted,
        predictedAbsent,
        predictedAttendance: predictedPercentage.toFixed(2),
      };
    });

    return predictedAttendanceList;
  }

  /**
   * Helper function to count the number of classes for each course within a given date range.
   */
  private calculateClassesInDateRange(startDate: Date, endDate: Date, calendar: Month[], timetable: DaySchedule[]): Map<string, number> {
    const classCounts = new Map<string, number>();
    
    const monthMap: { [key: string]: number } = {
      "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
      "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11,
    };

    const leaveStart = new Date(startDate);
    const leaveEnd = new Date(endDate);
    leaveStart.setHours(0, 0, 0, 0);
    leaveEnd.setHours(23, 59, 59, 999);

    calendar.forEach(month => {
      let monthIndex: number;
      let year: number;
      
      if (month.month.includes("'")) {
        const parts = month.month.split(" '");
        monthIndex = monthMap[parts[0]];
        year = 2000 + parseInt(parts[1], 10);
      } else {
        monthIndex = monthMap[month.month.trim()];
        year = new Date().getFullYear();
      }

      if (monthIndex === undefined || isNaN(year)) {
        return;
      }

      month.days.forEach(day => {
        try {
          const dayNumber = parseInt(day.date, 10);
          if (isNaN(dayNumber)) return;

          const dayDate = new Date(year, monthIndex, dayNumber);
          dayDate.setHours(0, 0, 0, 0);
          
          if (dayDate >= leaveStart && dayDate <= leaveEnd) {
            const dayOrder = day.dayOrder ? day.dayOrder.trim() : '';
            const dayName = day.day ? day.day.trim().toLowerCase() : '';
            const eventText = day.event ? day.event.trim().toLowerCase() : '';
            
            if (dayName === 'saturday' || dayName === 'sunday' || dayOrder === '' || dayOrder === '-' || eventText.includes('holiday')) {
              return;
            }
            
            const daySchedule = timetable.find(d => d.dayOrder === `Day ${dayOrder}`);
            
            if (daySchedule) {
              daySchedule.classes.forEach(course => {
                if (course.isClass && course.courseCode) {
                  classCounts.set(course.courseCode, (classCounts.get(course.courseCode) || 0) + 1);
                }
              });
            }
          }
        } catch (e) {
          console.error(`Error processing date: ${day.date} from month ${month.month}`, e);
        }
      });
    });

    return classCounts;
  }
}

