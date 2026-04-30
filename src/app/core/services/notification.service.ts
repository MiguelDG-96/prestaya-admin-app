import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { Observable, tap, of } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  type: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = `${environment.apiUrl}/notifications`;

  notifications = signal<Notification[]>([]);
  unreadCount = signal<number>(0);
  loading = signal<boolean>(false);

  loadNotifications(): Observable<Notification[]> {
    const user = this.authService.currentUser();
    if (!user || !user.email) return of([]);

    this.loading.set(true);
    return this.http.get<Notification[]>(`${this.apiUrl}/user/${user.email}`).pipe(
      tap(data => {
        this.notifications.set(data);
        this.unreadCount.set(data.filter(n => !n.isRead).length);
        this.loading.set(false);
      })
    );
  }

  markAllAsRead(): Observable<void> {
    const user = this.authService.currentUser();
    if (!user || !user.email) return of(void 0);

    return this.http.put<void>(`${this.apiUrl}/read-all/${user.email}`, {}).pipe(
      tap(() => this.loadNotifications().subscribe())
    );
  }
}
