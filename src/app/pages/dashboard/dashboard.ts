import { Component, inject, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule, NgClass } from '@angular/common';
import { Divider } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { AttendanceDetail, DaySchedule, MarksDetail } from '../data';
import { DataStoreService } from '../../data-store';
import { forkJoin, take } from 'rxjs';
import { ChipModule } from 'primeng/chip';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule,
    ChipModule,
    CommonModule,
    NgClass,
    Divider,
    ButtonModule,
    TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private dataStore = inject(DataStoreService);

  timetable: DaySchedule[] = [];
  currentDayIndex = 0;
  totalAttendance = 0;
  attendanceDetails: AttendanceDetail[] = [];
  marksDetails: MarksDetail[] = [];
  courseTitleMap = new Map<string, string>();
  overallMarks = 0;
  displayedAttendance = 0;
  obtainedMarks = 0;
  totalMarks = 0;
  
  ngOnInit() {
    // Get all data from the store at once
    forkJoin({
      timetable: this.dataStore.timetable$.pipe(take(1)),
      attendance: this.dataStore.attendance$.pipe(take(1)),
      marks: this.dataStore.marks$.pipe(take(1))
    }).subscribe(({ timetable, attendance, marks }) => {
      this.timetable = timetable;
      this.attendanceDetails = attendance;

      this.totalAttendance = this.calculateTotalAttendance(attendance);
      this.animateAttendance(this.totalAttendance);

      attendance.forEach((att: AttendanceDetail) => {
        this.courseTitleMap.set(att.courseCode, att.courseTitle);
      });

      this.marksDetails = marks.filter((detail: MarksDetail) => detail.course && !detail.course.toLowerCase().includes('course code'));
      const marksTotals = this.calculateOverallMarks(this.marksDetails);
      this.obtainedMarks = marksTotals.obtained;
      this.totalMarks = marksTotals.max;
      this.overallMarks = this.totalMarks > 0 ? (this.obtainedMarks / this.totalMarks) * 100 : 0;
      console.log(this.getLowestAttendanceCourses());
    });
  }

  private calculateTotalAttendance(attendance: AttendanceDetail[]): number {
    let totalConducted = 0;
    let totalAbsent = 0;
    for (const detail of attendance) {
      totalConducted += detail.courseConducted;
      totalAbsent += detail.courseAbsent;
    }
    return totalConducted > 0 ? ((totalConducted - totalAbsent) / totalConducted) * 100 : 0;
  }

  private calculateOverallMarks(marks: MarksDetail[]): { obtained: number; max: number } {
    const total = marks.reduce((acc, detail) => {
        const subjectTotal = detail.marks.reduce((sAcc, sMark) => {
            sAcc.obtained += sMark.obtained || 0;
            sAcc.max += sMark.maxMark || 0;
            return sAcc;
        }, { obtained: 0, max: 0 });
        acc.obtained += subjectTotal.obtained;
        acc.max += subjectTotal.max;
        return acc;
    }, { obtained: 0, max: 0 });

    return { obtained: parseFloat(total.obtained.toFixed(2)), max: total.max };
  }

  getAttendanceForCourse(courseCode: string): string {
    const course = this.attendanceDetails.find(a => a.courseCode === courseCode);
    return course ? `${course.courseAttendance}` : 'N/A';
  }

  getLowestAttendanceCourses(): AttendanceDetail[] {
    return this.attendanceDetails
      .filter(a => a.courseConducted > 0)
      .sort((a, b) => parseFloat(a.courseAttendance) - parseFloat(b.courseAttendance))
      .slice(0, 3);
  }

  animateAttendance(target: number) {
    let start = 0;
    const duration = 1000;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const current = start + progress * (target - start);
      
      this.displayedAttendance = parseFloat(current.toFixed(2));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.displayedAttendance = target;
      }
    };

    requestAnimationFrame(step);
  }

  getAttendanceChange(courseCode: string): { increase: number; decrease: number } | null {
    const detail = this.attendanceDetails.find(a => a.courseCode === courseCode);
    if (!detail || detail.courseConducted === 0) {
      return null;
    }

    const currentAttended = detail.courseConducted - detail.courseAbsent;
    const currentPercentage = (currentAttended / detail.courseConducted) * 100;


    const attendedNewPercentage = ((currentAttended + 1) / (detail.courseConducted + 1)) * 100;
    

    const missedNewPercentage = (currentAttended / (detail.courseConducted + 1)) * 100;
    
    const increase = attendedNewPercentage - currentPercentage;
    const decrease = currentPercentage - missedNewPercentage;

    return {
      increase: parseFloat(increase.toFixed(2)),
      decrease: parseFloat(decrease.toFixed(2))
    };
  }

  getAttendanceClass(courseCode: string): string {
    const course = this.attendanceDetails.find(a => a.courseCode === courseCode);
    if (course && course.courseAttendance) {
      const attendancePercentage = parseFloat(course.courseAttendance);
      if (!isNaN(attendancePercentage)) {
        return attendancePercentage >= 75 ? 'text-green-500' : 'text-red-500';
      }
    }
    return '';
  }

  nextDay() {
    if (this.currentDayIndex < this.timetable.length - 1) {
      this.currentDayIndex++;
    }
  }

  previousDay() {
    if (this.currentDayIndex > 0) {
      this.currentDayIndex--;
    }
  }
}

