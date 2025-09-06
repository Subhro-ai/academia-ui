import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { DataService, UserInfo } from '../data';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, SkeletonModule, ButtonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  private dataService = inject(DataService);
  private router = inject(Router);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  
  userInfo: UserInfo | null = null;
  isLoading = true;

  ngOnInit() {
    this.dataService.getUserInfo().subscribe({
      next: (data) => {
        this.userInfo = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch user info', err);
        this.isLoading = false;
      }
    });
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
    this.messageService.add({ severity: 'info', summary: 'Success', detail: message, life: 3000 });
    
    setTimeout(() => {
        this.router.navigate(['/login']);
    }, 1500);
  }
}

