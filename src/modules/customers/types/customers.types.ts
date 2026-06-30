import { AccountType, AccountTier } from '@/src/modules/account-opening/types/account-opening.types';

export type CustomerActivity = {
  event: string;
  description: string;
  time: string;
};

export type CustomerDetailOverview = {
  accountNumber: string;
  accountTier: number;
  accountType: string;
  dateOpened: string;
  depositStatus: string;
  depositsCount: number;
  mobileAppStatus: string;
  portfolioValue: string | number;
};

export type CustomerDetailBiodata = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  bvn: string;
  nin: string;
};

export type CustomerDetailAccount = {
  id?: string;
  accountNumber: string;
  accountType: string;
  currentTier: string;
  dateOpened: string;
  depositCount: number;
  depositStatus: string;
  portfolioValue: string | number;
  upgradeTierBanner?: {
    title: string;
    description: string;
    targetTier: number;
    status?: string;
  };
};

export type CustomerDetailResponse = {
  id: string;
  name: string;
  overview: CustomerDetailOverview;
  biodata: CustomerDetailBiodata;
  account: CustomerDetailAccount;
  activity: CustomerActivity[];
  inflows?: CustomerInflow[];
};

// ── Inflow types ──────────────────────────────────────────────────────────────

export type CustomerInflow = {
  id: string;
  transactionRef: string;
  amount: number;
  currency: string;
  narration: string;
  channel: string;
  senderName?: string;
  senderAccount?: string;
  createdAt: string;
};

export type CustomerInflowsResponse = {
  inflows: CustomerInflow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// ── List shape ────────────────────────────────────────────────────────────────

export type Customer = {
  id: string;
  requestId?: string;
  fullName: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  accountType: string;
  accountNumber?: string;
  accountOfficer?: string;
  tier: AccountTier;
  mobileActive: boolean;
  mobileOnboarded: boolean;
  hasDeposit: boolean;
  depositValue?: number;
  depositCount?: number;
  createdAt?: string;
};

export type CustomerSummary = {
  totalCustomers: number;
  mobileOnboarded: number;
  withDeposit: number;
  portfolioValue?: number | string;
};

export type CustomerListResponse = {
  customers: Customer[];
  summary?: CustomerSummary;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type BankOneDetails = {
  customerNumber: string;
  bvn?: string;
  nin?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  accounts: Array<{
    accountNumber: string;
    accountName: string;
    productCode: string;
    productName: string;
    accountBalance: number;
    status: string;
    dateOpened: string;
  }>;
  syncStatus: 'SUCCESS' | 'FAILED' | 'PENDING';
  lastSyncTime?: string;
  errorMessage?: string;
};
