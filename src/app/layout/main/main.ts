import { Component, HostListener, OnInit, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router'; 
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { AuthService } from '../../auth/auth';

interface NavItem {
  label: string;
  icon: string;
  route?: string;
  isLogout?: boolean;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, DrawerModule, DividerModule, DockModule, ButtonModule, CommonModule, RouterModule, MenuModule, RippleModule],
  templateUrl: './main.html',
  styleUrl: './main.css'
})
export class Main implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  isDesktop = true;
  sidebarVisible = true;
  desktopMenuItems: MenuItem[] = [];
  navItems: NavItem[] = [];

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  ngOnInit() {
    this.checkScreenSize();
    this.setupMenuItems();
  }

  private setupMenuItems() {
    const pages = [
        { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
        { label: 'Attendance', icon: 'pi pi-bolt', routerLink: '/attendance' },
        { label: 'Timetable', icon: 'pi pi-calendar', routerLink: '/timetable' },
        { label: 'Internals', icon: 'pi pi-chart-line', routerLink: '/internals' }
    ];

    this.desktopMenuItems = [{ label: 'Pages', items: pages }];

    // Navigation items for mobile footer navbar
    this.navItems = [
      { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
      { label: 'Attendance', icon: 'pi pi-bolt', route: '/attendance' },
      { label: 'Timetable', icon: 'pi pi-calendar', route: '/timetable' },
      { label: 'Internals', icon: 'pi pi-chart-line', route: '/internals' },
      { label: 'Profile', icon: 'pi pi-user', route: '/profile' }
    ];
  }

  private checkScreenSize() {
    this.isDesktop = window.innerWidth > 768;
    this.sidebarVisible = this.isDesktop;
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  onNavItemClick(item: NavItem) {
    if (item.isLogout) {
      this.logout();
    }
  }

  logout() {
    // Show loading message
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Logging out...', 
      detail: 'Please wait', 
      life: 2000 
    });

    // Get session cookie before clearing localStorage
    const sessionCookie = localStorage.getItem('sessionCookie');
    
    // Clear localStorage immediately
    localStorage.removeItem('sessionCookie');

    // Call backend logout if we have a session
    if (sessionCookie) {
      this.authService.logoutWithCookie(sessionCookie).subscribe({
        next: () => {
          console.log('Successfully logged out from backend');
          this.showSuccessAndRedirect('Logged out successfully!');
        },
        error: (err) => {
          console.error('Backend logout failed:', err);
          this.showSuccessAndRedirect('Logged out locally (server logout failed)');
        }
      });
    } else {
      this.showSuccessAndRedirect('Logged out successfully!');
    }
  }

  private showSuccessAndRedirect(message: string) {
    this.messageService.add({ 
      severity: 'success', 
      summary: 'Success', 
      detail: message, 
      life: 3000 
    });
    
    // Navigate to login immediately
    this.router.navigate(['/login']).then(() => {
      console.log('Navigation to login completed');
    });
  }
}