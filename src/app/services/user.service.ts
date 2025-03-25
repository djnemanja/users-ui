import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { User } from '../types/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/v1';
  private http = inject(HttpClient);

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`)
      .pipe(
        catchError(error => {
          console.error('Error fetching users:', error);
          return of([]);
        })
      );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, userData)
      .pipe(
        catchError(error => {
          console.error('Error updating user:', error);
          throw error;
        })
      );
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`)
      .pipe(
        catchError(error => {
          console.error('Error deleting user:', error);
          throw error;
        })
      );
  }
}
