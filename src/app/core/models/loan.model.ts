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
  paymentFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  frequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
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
  paymentFrequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
}

export interface PaymentRequest {
  loanId: string;
  amount: number;
  note?: string;
}
