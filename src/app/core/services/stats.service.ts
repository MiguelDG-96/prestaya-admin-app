import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/stats`;

  getOverallStats(filter: string = 'year'): Observable<any> {
    return this.http.get(`${this.apiUrl}/overall`, { params: { filter } });
  }

  getMonthlyStats(year: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/monthly`, { params: { year } });
  }

  getDailyStats(filter: string = 'today'): Observable<any> {
    return this.http.get(`${this.apiUrl}/daily`, { params: { filter } });
  }

  getDailyStatsForMonth(year: number, month: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/monthly/daily`, { params: { year, month } });
  }
}
