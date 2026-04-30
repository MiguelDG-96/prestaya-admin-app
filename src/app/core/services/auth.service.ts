import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/auth.model';
import { AuthMapper } from '../mappers/auth.mapper';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public http = inject(HttpClient);
  private router = inject(Router);
  public apiUrl = environment.apiUrl;

  // Signal for the current user
  currentUser = signal<User | null>(null);

  // Computed signals
  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role || 'GUEST');

  constructor() {
    this.checkSession();
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        this.setSession(response);
      })
    );
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_data', JSON.stringify(response));
    const user = AuthMapper.fromResponse(response);
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getFullPhotoUrl(photoUrl: string | undefined): string {
    if (!photoUrl) return '';
    if (photoUrl.startsWith('http')) return photoUrl;
    // Prevenir duplicación de /api
    const base = this.apiUrl.replace(/\/api$/, '');
    return base + photoUrl;
  }

  private checkSession(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const response = JSON.parse(userData) as AuthResponse;
        const user = AuthMapper.fromResponse(response);
        this.currentUser.set(user);
      } catch (e) {
        this.logout();
      }
    }
  }

  hasAuthority(authority: string): boolean {
    return this.currentUser()?.authorities.includes(authority) || this.userRole() === 'SUPER_ADMIN';
  }
}
