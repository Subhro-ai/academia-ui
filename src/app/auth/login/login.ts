import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastModule } from 'primeng/toast';
import { AuthService, LoginStep1Response } from '../auth';
import { switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    FloatLabelModule,
    ToastModule
  ],
  providers: [],
  templateUrl: './login.html'
})
export class LoginComponent {
  username = '';
  password = '';

  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  login() {
      if (!this.username || !this.password) {
      this.showError('Please enter both username and password.');
      return;
    }

    this.authService.loginStep1(this.username).pipe(
      switchMap((step1Response: LoginStep1Response) => {
        if (!step1Response || !step1Response.lookup) {
          throw new Error('Invalid username or registration number.');
        }
        const { identifier, digest } = step1Response.lookup;
        return this.authService.loginStep2(identifier, digest, this.password);
      })
    ).subscribe({
      next: (sessionCookie) => {
        console.log('Login successful! Storing cookie...');
        
        // --- THIS IS THE FIX: Store the cookie in localStorage ---
        localStorage.setItem('sessionCookie', sessionCookie);
        
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Login successful!' });
        
        // Navigate to the dashboard after a short delay to show the success message
        setTimeout(() => {
            this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        console.error('Login failed:', err);
        // Check for specific error messages from the backend
        const detail = err.error?.message || err.message || 'Invalid credentials or server error.';
        this.showError(detail);
      }
    });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Login Failed', detail: message });
  }
}