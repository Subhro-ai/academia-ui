import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; 
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router'; 
import { DockModule } from 'primeng/dock';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, DrawerModule,DividerModule,DockModule, ButtonModule, CommonModule, RouterModule, MenuModule, RippleModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit {

  constructor(private router: Router) {}
  isDesktop = true;
  sidebarVisible = true;
  desktopMenuItems: MenuItem[] | undefined; 
  footerItems: MenuItem[] | undefined;
  navItems: NavItem[] = [];

  // Listen for window resize events to check screen size
  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    
    const pages = [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard', styleClass: 'dock-item' },
        { label: 'Attendance', icon: 'pi pi-bolt', routerLink: '/attendance', styleClass: 'dock-item' },
        { label: 'Timetable', icon: 'pi pi-calendar', routerLink: '/timetable', styleClass: 'dock-item' },
        { label: 'Internals', icon: 'pi pi-chart-line', routerLink: '/internals', styleClass: 'dock-item' }
    ];

    this.desktopMenuItems = [{ label: 'Pages', items: pages }];

    this.footerItems = [
        { separator: true },
        { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile', styleClass: 'dock-item' },
        { label: 'Logout', icon: 'pi pi-sign-out', styleClass: 'logout-item' }
    ];

    // Navigation items for custom footer navbar
    this.navItems = [
      { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
      { label: 'Attendance', icon: 'pi pi-bolt', route: '/attendance' },
      { label: 'Timetable', icon: 'pi pi-calendar', route: '/timetable' },
      { label: 'Internals', icon: 'pi pi-chart-line', route: '/marks' },
      { label: 'Profile', icon: 'pi pi-user', route: '/profile' }
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