import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DataService, AttendanceDetail } from '../data';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

interface MarginInfo {
  value: number;
  label: string;
}
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, CardModule],
  templateUrl: './attendance.html',
  styleUrls: ['./attendance.css'],
  animations: [
    trigger('cardAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})

export class Attendance implements OnInit{
  private dataService = inject(DataService);
  attendanceDetails: AttendanceDetail[] = [];

  ngOnInit() {
    this.dataService.getAttendance().subscribe({
      next: (data) => {
        this.attendanceDetails = data;
      },
      error: (err) => {
        console.error('Failed to fetch attendance details', err);
      }
    });
  }

  getAttendancePercentage(detail: AttendanceDetail): number {
    if (detail.courseConducted === 0) {
      return 100;
    }
    
    return parseFloat(((detail.courseConducted - detail.courseAbsent) / detail.courseConducted * 100).toFixed(2));
  }

  getAttendanceColor(percentage: number): string {
    return percentage >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  getMarginInfo(detail: AttendanceDetail): MarginInfo {
    const percentage = this.getAttendancePercentage(detail);
    const attended = detail.courseConducted - detail.courseAbsent;

    if (percentage >= 75) {
      const value = Math.floor(attended / 0.75 - detail.courseConducted);
      return { value, label: 'Margin' };
    } else {
      const value = Math.ceil((0.75 * detail.courseConducted - attended) / 0.25);
      return { value, label: 'Required' };
    }
  }
}
