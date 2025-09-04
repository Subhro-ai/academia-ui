import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { DataService, MarksDetail, mark } from '../data';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-internals',
  imports: [CommonModule, CardModule, ChipModule, DividerModule],
  templateUrl: './internals.html',
  styleUrl: './internals.css'
})
export class Internals {
private dataService = inject(DataService);
  marksDetails: MarksDetail[] = [];
  private courseTitleMap = new Map<string, string>();

  ngOnInit() {
    forkJoin({
      marks: this.dataService.getMarks(),
      attendance: this.dataService.getAttendance()
    }).subscribe({
      next: ({ marks, attendance }) => {
        attendance.forEach(att => {
          this.courseTitleMap.set(att.courseCode, att.courseTitle);
        });

        this.marksDetails = marks.filter(detail => detail.course && !detail.course.toLowerCase().includes('course code'));
      },
      error: (err) => {
        console.error('Failed to fetch marks or attendance data', err);
      }
    });
  }
  
  getCourseTitle(courseIdentifier: string): string {
    const courseCode = courseIdentifier.replace('Regular','').trim();
    return this.courseTitleMap.get(courseCode) || courseIdentifier;
  }

  calculateTotal(marks: any[]): { obtained: number; max: number } {
    return marks.reduce(
      (acc, mark) => {
        acc.obtained += mark.obtained || 0;
        acc.max += mark.maxMark || 0;
        return acc;
      },
      { obtained: 0, max: 0 }
    );
  }

  getMarkPillClass(mark: mark): string {
    if (!mark || typeof mark.obtained !== 'number' || typeof mark.maxMark !== 'number' || mark.maxMark === 0) {
      return 'bg-surface-700';
    }
    const percentage = (mark.obtained / mark.maxMark) * 100;
    return percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  }

  getTotalPillClass(total: { obtained: number; max: number }): string {
    if (!total || total.max === 0) {
      return 'bg-surface-700';
    }
    const percentage = (total.obtained / total.max) * 100;
    return percentage >= 50 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400';
  }
}
