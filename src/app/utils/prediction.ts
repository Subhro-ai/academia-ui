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
   * Predicts attendance percentages for all courses if a student takes leave for a specified period.
   * @param startDate The start date of the leave.
   * @param endDate The end date of the leave.
   * @param data The combined prediction data.
   * @returns An array of PredictedAttendance objects with the new calculated values.
   */
  predictAttendanceOnLeave(startDate: Date, endDate: Date, data: PredictionData): PredictedAttendance[] {
    const futureAbsences = this.calculateFutureAbsences(startDate, endDate, data.calendar, data.timetable);
    
    const predictedAttendanceList = data.attendance.map(subject => {
      const additionalAbsences = futureAbsences.get(subject.courseCode) || 0;
      
      // For prediction, we assume the missed classes would have been conducted.
      const predictedConducted = subject.courseConducted + additionalAbsences;
      const predictedAbsent = subject.courseAbsent + additionalAbsences;
      
      let predictedPercentage = 0;
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
   * Helper function to count the number of classes for each course within a date range.
   */
  private calculateFutureAbsences(startDate: Date, endDate: Date, calendar: Month[], timetable: DaySchedule[]): Map<string, number> {
    const absences = new Map<string, number>();
    const monthMap: { [key: string]: number } = {
      "Jan '25": 0, "Feb '25": 1, "Mar '25": 2, "Apr '25": 3, "May '25": 4, "Jun '25": 5,
      "Jul '25": 6, "Aug '25": 7, "Sep '25": 8, "Oct '25": 9, "Nov '25": 10, "Dec '25": 11
    };

    // Set times to 0 to ensure we're only comparing dates
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    calendar.forEach(month => {
      // Handles month formats like "Jul '25"
      const parts = month.month.split(" '");
      if (parts.length !== 2) {
        console.error(`Invalid month format: ${month.month}`);
        return; // Skip this month if format is unexpected
      }

      const monthAbbr = parts[0];
      const yearShort = parts[1];
      
      const monthIndex = monthMap[monthAbbr];
      const year = 2000 + parseInt(yearShort, 10);

      if (monthIndex === undefined || isNaN(year)) {
        console.error(`Could not parse month/year from: ${month.month}`);
        return; // Skip if month or year is invalid
      }

      month.days.forEach(day => {
        try {
          const dayNumber = parseInt(day.date, 10);
          if (isNaN(dayNumber)) return;

          // Create date with the correctly parsed year and month
          const dayDate = new Date(year, monthIndex, dayNumber);
          dayDate.setHours(0, 0, 0, 0);
          
          if (dayDate >= startDate && dayDate <= endDate && day.dayOrder && day.dayOrder.trim() !== '' && day.dayOrder.trim() !== '-') {
            const daySchedule = timetable.find(d => d.dayOrder === `Day ${day.dayOrder}`);
            if (daySchedule) {
              daySchedule.classes.forEach(course => {
                if (course.isClass && course.courseCode) {
                  absences.set(course.courseCode, (absences.get(course.courseCode) || 0) + 1);
                }
              });
            }
          }
        } catch (e) {
          console.error(`Could not parse date: ${day.date} from month ${month.month}`, e);
        }
      });
    });

    return absences;
  }
}

