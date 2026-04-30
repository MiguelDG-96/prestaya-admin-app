import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Loan, LoanCreateRequest, PaymentRequest } from '../models/loan.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/loans`;

  loans = signal<Loan[]>([]);
  loading = signal<boolean>(true);

  loadLoans(): Observable<Loan[]> {
    this.loading.set(true);
    return this.http.get<Loan[]>(this.apiUrl).pipe(
      tap(data => {
        this.loans.set(data);
        this.loading.set(false);
      })
    );
  }

  createLoan(loan: LoanCreateRequest): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, loan).pipe(
      tap(() => this.loadLoans().subscribe())
    );
  }

  registerPayment(payment: { loanId: string; amount: number; note?: string }): Observable<void> {
    const payload = {
      loan: { id: payment.loanId },
      amount: payment.amount,
      notes: payment.note
    };
    return this.http.post<void>(`${environment.apiUrl}/payments`, payload).pipe(
      tap(() => this.loadLoans().subscribe())
    );
  }

  getPayments(loanId: string): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/payments/loan/${loanId}`);
  }

  updateLoan(id: string, loan: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/${id}`, loan).pipe(
      tap(() => this.loadLoans().subscribe())
    );
  }

  deleteLoan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadLoans().subscribe())
    );
  }
}
