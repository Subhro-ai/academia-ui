import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule, NgClass } from '@angular/common';
import { Divider } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table'; // Import TableModule
import { AttendanceDetail, DataService, DaySchedule, MarksDetail } from '../data';
@Component({
  selector: 'app-dashboard',
  imports: [CardModule, 
    CommonModule,
    Divider,
    ButtonModule,
    TableModule,],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private dataService = inject(DataService);

  timetable: DaySchedule[] = [];
  currentDayIndex = 0;
  totalAttendance = 0;
  attendaceList: AttendanceDetail[] = [];
  marksList: MarksDetail[] = [];
  totalMarks = 0;
  obtainedMarks = 0;
  totalmarkList: number[] = [];

  ngOnInit() {
    this.dataService.getTimetable().subscribe({
      next: (data) => {
        this.timetable = data;
        console.log('Timetable data received:', this.timetable);
      },
      error: (err) => {
        console.error('Failed to fetch timetable', err);
        // Handle error, maybe show a toast message
      }
    });
    this.dataService.getTotalAttendance().subscribe({
      next: (data) => {
        this.totalAttendance = data.totalAttendancePercentage;
      },
      error: (err) => {
        console.error('Failed to fetch total attendance', err);
      }
    });

    this.dataService.getAttendance().subscribe({
      next: (data) => {
        this.attendaceList = data;
        console.log('Attendance data received:', this.attendaceList);
      },
      error: (err) => {
        console.error('Failed to fetch attendance', err);
      }
    });

    this.dataService.getMarks().subscribe({
      next: (data) => {
        console.log('Marks data received:', data);
        this.marksList = data;
        this.totalmarkList = this.dataService.getTotalMarks(this.marksList);
        // console.log(this.totalmarkList);
        this.obtainedMarks = this.totalmarkList[0];
        this.totalMarks = this.totalmarkList[1];
      },
      error: (err) => {
        console.error('Failed to fetch marks', err);
      }
    });
  }



  getAttendanceForCourse(courseCode: string): string {
    const course = this.attendaceList.find(a => a.courseCode === courseCode);
    return course ? `${course.courseAttendance}` : 'N/A';
    console.log(this.totalmarkList);
  }

  getAttendanceClass(courseCode: string): string {
    const course = this.attendaceList.find(a => a.courseCode === courseCode);
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
