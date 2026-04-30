export interface Rental {
  id: string;
  tenant: {
    id: string;
    name: string;
    dni: string;
    phone: string;
  };
  amount: number; // monthly rent in backend
  amountPaid: number;
  startDate: string;
  dueDate: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  totalMonths: number;
  paidMonths: number;
  securityDeposit: number;
  roomNumber: string;
}

export interface RentalCreateRequest {
  tenantId: string;
  roomId: string;
  monthlyRent: number;
  securityDeposit?: number;
  startDate: string;
  totalMonths: number;
}
