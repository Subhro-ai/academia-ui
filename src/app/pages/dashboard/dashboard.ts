import { Component, inject } from '@angular/core';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Divider } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table'; // Import TableModule
import { DataService, DaySchedule } from '../data';
@Component({
  selector: 'app-dashboard',
  imports: [CardModule, 
    CommonModule,
    Divider,
    ButtonModule,
    TableModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private dataService = inject(DataService);

  timetable: DaySchedule[] = [];
  currentDayIndex = 0;

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
