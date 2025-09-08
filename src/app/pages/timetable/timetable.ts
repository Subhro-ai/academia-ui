import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DataService, DaySchedule } from '../data';
import { DataStoreService } from '../../data-store';
import { take } from 'rxjs';

@Component({
  selector: 'app-timetable',
  imports: [CommonModule, ButtonModule, CardModule, TableModule],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css'
})
export class Timetable implements OnInit{
  private dataService = inject(DataStoreService);

  timetable: DaySchedule[] = [];
  currentDayIndex = 0;
  isLoading = true;

  ngOnInit() {
    this.dataService.timetable$.pipe(take(1)).subscribe({
      next: (data) => {
        this.timetable = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch timetable', err);
        this.isLoading = false;
      }
    });
  }

  get currentDayClasses() {
    if (!this.timetable || this.timetable.length === 0) {
      return [];
    }
    return this.timetable[this.currentDayIndex].classes.filter(c => c.isClass);
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
