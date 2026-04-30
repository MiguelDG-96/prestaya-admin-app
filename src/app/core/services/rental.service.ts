import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Rental, RentalCreateRequest } from '../models/rental.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RentalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rentals`;

  rentals = signal<Rental[]>([]);
  loading = signal<boolean>(true);

  loadRentals(): Observable<Rental[]> {
    this.loading.set(true);
    return this.http.get<Rental[]>(this.apiUrl).pipe(
      tap(data => {
        this.rentals.set(data);
        this.loading.set(false);
      })
    );
  }

  createRental(rental: RentalCreateRequest): Observable<Rental> {
    return this.http.post<Rental>(this.apiUrl, rental).pipe(
      tap(() => this.loadRentals().subscribe())
    );
  }

  registerPayment(payment: { rentalId: string; amount: number; note?: string }): Observable<void> {
    const payload = {
      rental: { id: payment.rentalId },
      amount: payment.amount,
      notes: payment.note
    };
    return this.http.post<void>(`${environment.apiUrl}/payments`, payload).pipe(
      tap(() => this.loadRentals().subscribe())
    );
  }

  getPayments(rentalId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/payments/rental/${rentalId}`);
  }

  updateRental(id: string, rental: Partial<Rental>): Observable<Rental> {
    return this.http.put<Rental>(`${this.apiUrl}/${id}`, rental).pipe(
      tap(() => this.loadRentals().subscribe())
    );
  }

  deleteRental(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadRentals().subscribe())
    );
  }
}
