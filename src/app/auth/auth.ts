import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LoginStep1Response {
  lookup: {
    identifier: string;
    digest: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';

  loginStep1(username: string): Observable<LoginStep1Response> {
    const body = { username };
    return this.http.post<LoginStep1Response>(`${this.apiUrl}/login-step1`, body);
  }

  loginStep2(identifier: string, digest: string, password: string): Observable<string> {
    const body = { identifier, digest, password };
    return this.http.post(`${this.apiUrl}/login-step2`, body, { responseType: 'text' });
  }

  logout(): Observable<any> {
    const sessionCookie = localStorage.getItem('sessionCookie');
    return this.logoutWithCookie(sessionCookie);
  }

  logoutWithCookie(sessionCookie: string | null): Observable<any> {
    if (!sessionCookie) {
      return of({ success: true, message: 'No session to logout' });
    }

    const headers = new HttpHeaders().set('X-Academia-Auth', sessionCookie);
    
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      catchError((error) => {
        console.error('Logout API error:', error);
        // Don't throw error, return success so frontend logout can proceed
        return of({ success: false, error: error.message });
      })
    );
  }

  // Helper method to check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('sessionCookie');
  }

  // Helper method to get session cookie
  getSessionCookie(): string | null {
    return localStorage.getItem('sessionCookie');
  }

  // Helper method to clear session
  clearSession(): void {
    localStorage.removeItem('sessionCookie');
  }
}