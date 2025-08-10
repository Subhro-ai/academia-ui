import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; 
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, DrawerModule,DividerModule, ButtonModule, CommonModule, RouterModule, MenuModule, RippleModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit {
  isDesktop = true;
  sidebarVisible = true;
  items: MenuItem[] | undefined;
  footerItems: MenuItem[] | undefined;

  // Listen for window resize events to check screen size
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    this.items = [
      {
        separator: true
      },
      {
        label: 'Pages',
        items: [
          {
          label: 'Dashboard',
          icon: 'pi pi-fw pi-home',
          routerLink: '/dashboard',
          },
          {
            label: 'Attendance',
          icon: 'pi pi-fw pi-bolt',
          routerLink: '/attendance',
          },
          {
            label: 'Timetable',
          icon: 'pi pi-fw pi-calendar',
          routerLink: '/timetable',
          },
          {
            label: 'Internals',
          icon: 'pi pi-fw pi-chart-line',
          routerLink: '/marks',
          },
        ]
      }
    ];
    this.footerItems = [
      { separator: true }, // The PrimeNG separator
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: '/profile'
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        routerLink: '/profile',
        styleClass: 'logout-item'
      }
    ];
  }

  private checkScreenSize() {
    // Use 768px as the breakpoint between mobile and desktop
    this.isDesktop = window.innerWidth > 768;
    // On desktop, the sidebar is visible by default. On mobile, it starts hidden.
    this.sidebarVisible = this.isDesktop;
  }

  // This function will be called by our menu button
  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }
}