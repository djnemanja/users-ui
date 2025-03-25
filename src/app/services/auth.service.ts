import { Injectable, signal } from '@angular/core';
import type { User } from '../types/user';
import { HttpClient } from '@angular/common/http';  
import { Observable, tap, catchError, of, map } from 'rxjs';
import { Router } from '@angular/router';

interface LoginResponse {
  user: User;
}

interface RegisterResponse {
  user: User;
}

interface CheckAuthResponse {
  authenticated: boolean;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1';
  
  currentUserSig = signal<User | null>(null);
  
  isLoadingSig = signal<boolean>(false);
  isAuthenticatedSig = signal<boolean>(false);
  
  constructor(
    private _httpClient: HttpClient,
    private router: Router
  ) {
  
    if (!window.location.pathname.includes('/login') && 
        !window.location.pathname.includes('/register')) {
      this.checkAuth().subscribe();
    }
    
    window.addEventListener('auth:unauthorized', () => {
      this.handleUnauthorized();
    });
  }

  login(data: { email: string, password: string }): Observable<LoginResponse> {
    this.isLoadingSig.set(true);
    
    return this._httpClient.post<LoginResponse>(`${this.apiUrl}/auth/login`, data)
      .pipe(
        tap(response => {
          if (response && response.user) {
            this.handleAuthentication(response.user);
          }
          this.isLoadingSig.set(false);
        }),
        catchError(error => {
          this.isLoadingSig.set(false);
          return of(error);
        })
      );
  }
  
  register(data: { 
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    address?: string;
  }): Observable<RegisterResponse> {
    this.isLoadingSig.set(true);
    
    return this._httpClient.post<RegisterResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(() => {
          this.isLoadingSig.set(false);
        }),
        catchError(error => {
          this.isLoadingSig.set(false);
          return of(error);
        })
      );
  }

  logout(): Observable<any> {
    return this._httpClient.post(`${this.apiUrl}/auth/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        })
      );
  }

  checkAuth(): Observable<User | null> {
    if (this.currentUserSig()) {
      return of(this.currentUserSig());
    }
    
    this.isLoadingSig.set(true);
    
    return this._httpClient.get<CheckAuthResponse>(`${this.apiUrl}/auth/check`)
      .pipe(
        tap(response => {
          if (response.authenticated && response.user) {
            this.handleAuthentication(response.user);
          } else {
            this.clearAuthData();
          }
          this.isLoadingSig.set(false);
        }),
        catchError(error => {
          this.clearAuthData();
          this.isLoadingSig.set(false);
          return of(null);
        }),

        map(response => response?.authenticated && response?.user ? response.user : null)
      );
  }
  

  private handleAuthentication(user: User): void {
    this.currentUserSig.set(user);
    this.isAuthenticatedSig.set(true);
  }
  
  private clearAuthData(): void {
    this.currentUserSig.set(null);
    this.isAuthenticatedSig.set(false);
  }

  private handleUnauthorized(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }
}
