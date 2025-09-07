import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DataService, AttendanceDetail } from '../data';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { PredictionService, PredictionData, PredictedAttendance } from '../../utils/prediction';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DatePickerModule } from 'primeng/datepicker';

interface MarginInfo {
  value: number;
  label: string;
}

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule, 
    CardModule, 
    NgClass, 
    ButtonModule, 
    DialogModule, 
    DatePickerModule, 
    FormsModule, 
    FloatLabelModule
  ],
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
export class Attendance implements OnInit {
  private dataService = inject(DataService);
  private predictionService = inject(PredictionService);

  attendanceDetails: (AttendanceDetail | PredictedAttendance)[] = [];
  private originalAttendanceDetails: AttendanceDetail[] = [];
  
  isPredicting = false;
  showPredictionDialog = false;
  isLoadingPredictionData = false;
  isMobile = false;
  private predictionData: PredictionData | null = null;
  rangeDates: Date[] | undefined = undefined;
  
  

  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    this.dataService.getAttendance().subscribe({
      next: (data) => {
        this.attendanceDetails = data;
        this.originalAttendanceDetails = [...data];
      },
      error: (err) => {
        console.error('Failed to fetch attendance details', err);
      }
    });
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  openPredictionDialog() {
    this.isLoadingPredictionData = true;
    this.predictionService.getPredictionData().subscribe({
      next: (data) => {
        this.predictionData = data;
        this.isLoadingPredictionData = false;
        this.showPredictionDialog = true;
        this.rangeDates = undefined; // Reset dates when opening dialog
      },
      error: (err) => {
        console.error('Failed to fetch prediction data', err);
        this.isLoadingPredictionData = false;
      }
    });
  }

  runPrediction() {
    console.log(this.attendanceDetails);
    if (this.rangeDates && this.rangeDates.length === 2 && this.rangeDates[0] && this.rangeDates[1] && this.predictionData) {
      this.attendanceDetails = this.predictionService.predictAttendanceOnLeave(
        this.rangeDates[0],
        this.rangeDates[1],
        this.predictionData
      );
      this.isPredicting = true;
      this.showPredictionDialog = false;
      this.rangeDates = undefined;
    }
  }

  resetPrediction() {
    this.attendanceDetails = this.originalAttendanceDetails;
    this.isPredicting = false;
  }

  closePredictionDialog() {
    this.showPredictionDialog = false;
    this.rangeDates = undefined;
  }

  isPredicted(detail: AttendanceDetail | PredictedAttendance): detail is PredictedAttendance {
    return 'predictedAttendance' in detail;
  }
  
  getAttendedCount(detail: AttendanceDetail | PredictedAttendance): number {
    return this.isPredicted(detail) 
      ? detail.predictedConducted - detail.predictedAbsent 
      : detail.courseConducted - detail.courseAbsent;
  }

  getAbsentCount(detail: AttendanceDetail | PredictedAttendance): number {
    return this.isPredicted(detail) ? detail.predictedAbsent : detail.courseAbsent;
  }
  
  getTotalConducted(detail: AttendanceDetail | PredictedAttendance): number {
    return this.isPredicted(detail) ? detail.predictedConducted : detail.courseConducted;
  }

  getAttendancePercentage(detail: AttendanceDetail | PredictedAttendance): number {
    if (this.isPredicted(detail)) {
      return parseFloat(detail.predictedAttendance);
    }
    if (detail.courseConducted === 0) {
      return 100;
    }
    return parseFloat(((detail.courseConducted - detail.courseAbsent) / detail.courseConducted * 100).toFixed(2));
  }

  getAttendanceColor(percentage: number): string {
    return percentage >= 75 ? 'text-green-400' : 'text-red-400';
  }

  getMarginInfo(detail: AttendanceDetail | PredictedAttendance): MarginInfo {
    const conducted = this.getTotalConducted(detail);
    const absent = this.getAbsentCount(detail);
    
    if (conducted === 0) {
      return { value: 0, label: 'Margin' };
    }

    const percentage = ((conducted - absent) / conducted) * 100;
    const attended = conducted - absent;

    if (percentage >= 75) {
      const value = Math.floor(attended / 0.75 - conducted);
      return { value, label: 'Margin' };
    } else {
      const value = Math.ceil((0.75 * conducted - attended) / 0.25);
      return { value, label: 'Required' };
    }
  }

  // Helper to check if dates are selected
  get areDatesSelected(): boolean {
    return !!(this.rangeDates && this.rangeDates.length === 2 && this.rangeDates[0] && this.rangeDates[1]);
  }
}