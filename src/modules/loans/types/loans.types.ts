export type LoanStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'DISBURSED';

export type LoanApplication = {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  tenure: number;
  purpose: string;
  status: LoanStatus;
  staffId: string;
  createdAt: string;
};
