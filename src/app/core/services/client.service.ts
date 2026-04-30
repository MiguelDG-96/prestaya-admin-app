import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Client, ClientCreateRequest } from '../models/client.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/clients`;

  clients = signal<Client[]>([]);
  loading = signal<boolean>(false);

  loadClients(): Observable<Client[]> {
    this.loading.set(true);
    return this.http.get<Client[]>(this.apiUrl).pipe(
      tap(data => {
        this.clients.set(data);
        this.loading.set(false);
      })
    );
  }

  createClient(client: ClientCreateRequest): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client).pipe(
      tap(() => this.loadClients().subscribe())
    );
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadClients().subscribe())
    );
  }

  updateClient(id: string, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client).pipe(
      tap(() => this.loadClients().subscribe())
    );
  }

  checkDni(dni: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-dni`, { params: { dni } });
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-email`, { params: { email } });
  }

  consultDni(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/consult-dni/${dni}`);
  }
}
