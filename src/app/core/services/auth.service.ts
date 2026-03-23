// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environment/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.base}/login`, { username, password })
      .pipe(
        tap(res => {
          if (res?.data?.token) {
            localStorage.setItem('Authorization', res.data.token);
            localStorage.setItem('trole', res.data.role || '');
            localStorage.setItem('tname', res.data.name || '');
          }
        })
      );
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('Authorization');
  }

  getRole(): string {
    return localStorage.getItem('trole') || '';
  }

  getUserName(): string {
    return localStorage.getItem('tname') || '';
  }
}
