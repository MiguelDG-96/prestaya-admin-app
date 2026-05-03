export interface Loan {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  interestRate: number;
  totalToPay: number;
  amountPaid: number;
  paidInstallments: number;
  totalInstallments: number;
  startDate: string;
  dueDate: string;
  status: string;
  paymentFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'BIWEEK' | 'MONTHLY';
  frequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'BIWEEK' | 'MONTHLY';
  client?: {
    id: string;
    name: string;
    dni: string;
  };
}

export interface LoanCreateRequest {
  clientId: string;
  amount: number;
  interestRate: number;
  totalInstallments: number;
  startDate: string;
  paymentFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'BIWEEK' | 'MONTHLY';
}

export interface PaymentRequest {
  loanId: string;
  amount: number;
  note?: string;
}
