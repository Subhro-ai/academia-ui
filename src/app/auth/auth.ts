import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}