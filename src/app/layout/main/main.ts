import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router'; 
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router'; 
import { DockModule } from 'primeng/dock';
import { AuthService } from '../../auth/auth';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  command?: () => void; // Changed to expect no arguments
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, DrawerModule,DividerModule,DockModule, ButtonModule, CommonModule, RouterModule, MenuModule, RippleModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

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
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
        { label: 'Attendance', icon: 'pi pi-bolt', routerLink: '/attendance' },
        { label: 'Timetable', icon: 'pi pi-calendar', routerLink: '/timetable' },
        { label: 'Internals', icon: 'pi pi-chart-line', routerLink: '/marks' }
    ];

    this.desktopMenuItems = [{ label: 'Pages', items: pages }];

    this.footerItems = [
        { separator: true },
        { label: 'Profile', icon: 'pi pi-user', routerLink: '/profile' },
        { 
          label: 'Logout', 
          icon: 'pi pi-sign-out', 
          styleClass: 'logout-item',
          command: () => this.logout() // Changed to expect no arguments
        }
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

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.performFrontendLogout();
      },
      error: (err) => {
        console.error('Logout failed on backend:', err);
        this.performFrontendLogout('Logout failed on the server, but you have been logged out locally.');
      }
    });
  }

  private performFrontendLogout(message = 'Logged out successfully!') {
    localStorage.removeItem('sessionCookie');
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    
    setTimeout(() => {
        this.router.navigate(['/login']);
    }, 1500);
  }
}

