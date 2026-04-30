import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Tenant, TenantCreateRequest } from '../models/tenant.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tenants`;

  tenants = signal<Tenant[]>([]);
  loading = signal<boolean>(false);

  loadTenants(): Observable<Tenant[]> {
    this.loading.set(true);
    return this.http.get<Tenant[]>(this.apiUrl).pipe(
      tap(data => {
        this.tenants.set(data);
        this.loading.set(false);
      })
    );
  }

  createTenant(tenant: TenantCreateRequest): Observable<Tenant> {
    return this.http.post<Tenant>(this.apiUrl, tenant).pipe(
      tap(() => this.loadTenants().subscribe())
    );
  }

  deleteTenant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTenants().subscribe())
    );
  }
}
