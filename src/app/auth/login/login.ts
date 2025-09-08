import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { AuthService, LoginStep1Response } from '../auth';
import { switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DataStoreService } from '../../data-store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    InputGroupModule,
    InputGroupAddonModule,
    FloatLabelModule
  ],
  providers: [],
  templateUrl: './login.html'
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  statusMessage = 'Authenticating...';

  private authService = inject(AuthService);
  private dataStoreService = inject(DataStoreService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  login() {
    if (!this.username || !this.password) {
      this.showError('Please enter both username and password.');
      return;
    }

    this.isLoading = true;
    this.statusMessage = 'Authenticating...';
    const fullUsername = this.username + '@srmist.edu.in';

    this.authService.loginStep1(fullUsername).pipe(
      switchMap((step1Response: LoginStep1Response) => {
        if (!step1Response || !step1Response.lookup) {
          throw new Error('Invalid username or registration number.');
        }
        const { identifier, digest } = step1Response.lookup;
        return this.authService.loginStep2(identifier, digest, this.password);
      })
    ).subscribe({
      next: (sessionCookie) => {
        localStorage.setItem('sessionCookie', sessionCookie);
        this.statusMessage = 'Fetching your data...';
        
        // Fetch all data and store it centrally
        this.dataStoreService.fetchAllData().subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successful!' });
                this.router.navigate(['/dashboard']);
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Failed to fetch initial data:', err);
                this.showError('Logged in, but could not fetch academic data.');
                this.isLoading = false;
            }
        });
      },
      error: (err) => {
        console.error('Login failed:', err);
        const detail = err.error?.message || err.message || 'Invalid credentials or server error.';
        this.showError(detail);
        this.isLoading = false;
      }
    });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: message });
  }
}

