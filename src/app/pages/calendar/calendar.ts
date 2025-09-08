import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DayEvent, Month } from '../data';
import { DataStoreService } from '../../data-store';
import { SkeletonModule } from 'primeng/skeleton';
import { FieldsetModule } from 'primeng/fieldset';
import { take } from 'rxjs';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, CardModule, SkeletonModule, FieldsetModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.css']
})
export class Calendar implements OnInit {
  private dataStore = inject(DataStoreService);
  calendarData: Month[] = [];
  isLoading = true;
  count : number = 0;
  currentMonthName: string;

  constructor() {
    this.currentMonthName = new Date().toLocaleString('en-US', { month: 'long' });
    console.log(this.currentMonthName);
    this.currentMonthName = this.mapMonthName(this.currentMonthName);
  }

  ngOnInit() {
    this.dataStore.calendar$.pipe(take(1)).subscribe({
      next: (data) => {
        this.calendarData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch calendar data from store', err);
        this.isLoading = false;
      }
    });
  }

  isHoliday(event: DayEvent): boolean {
    
    const day = event.day.trim().toLowerCase();
    const dayOrder = event.dayOrder ? event.dayOrder.trim() : '';
    const eventText = event.event ? event.event.trim().toLowerCase() : '';
    return dayOrder === '-' || day === 'saturday' || day === 'sunday' || eventText.includes('holiday');
  }

  mapMonthName(monthName: string): string {
    const monthMap: { [key: string]: string } = {
      'January': "Jan '25",
      'February': "Feb '25",
      'March': "Mar '25",
      'April': "Apr '25",
      'May': "May '25",
      'June': "Jun '25",
      'July': "Jul '25",
      'August': "Aug '25",
      'September': "Sep '25",
      'October': "Oct '25",
      'November': "Nov '25",
      'December': "Dec '25"
    };
    return monthMap[monthName] || monthName;
    };

}

