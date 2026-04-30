import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User, UserCreateRequest } from '../models/user.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  users = signal<User[]>([]);
  loading = signal<boolean>(false);

  loadUsers(): Observable<User[]> {
    this.loading.set(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(data => {
        this.users.set(data);
        this.loading.set(false);
      })
    );
  }

  createUser(user: UserCreateRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, user).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }
}
