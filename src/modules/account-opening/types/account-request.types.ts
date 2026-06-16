export type AccountCategory = 'INDIVIDUAL' | 'CORPORATE';
export type AccountType = 'SAVINGS' | 'CURRENT';
export type AccountTier = 'TIER_1' | 'TIER_2' | 'TIER_3';

export type AccountRequestStatus =
  | 'SUBMITTED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'MANUAL_REVIEW';

export type AccountRequestRM = {
  staffId: string;
  staffName: string;
  email?: string;
  role?: string;
};

export type AccountRequest = {
  id: string;
  requestNumber: string;
  clientDraftId?: string;
  idempotencyKey?: string;
  accountCategory: AccountCategory;
  accountType: AccountType;
  tier?: AccountTier;
  status: AccountRequestStatus;
  workflowStage?: string;
  rm?: AccountRequestRM;
  branchId?: string;
  verificationMode?: string;
  bankOneCustomerId?: string;
  bankOneAccountNumber?: string;
  createdAt: string;
  submittedAt?: string;
  cancelledAt?: string;
};

export type InitiateAccountPayload = {
  verificationId: string;
  accountCategory: AccountCategory;
  accountType: AccountType;
  clientDraftId: string;
  idempotencyKey: string;
};

export type AccountEnquiryResponse = {
  accountNumber: string;
  accountName: string;
  bvn?: string;
  nin?: string;
  phoneNumber?: string;
  email?: string;
  status?: string;
  accountCategory?: AccountCategory;
  accountType?: AccountType;
  tier?: AccountTier;
};

export type GetAllAccountsParams = {
  page?: number;
  limit?: number;
};
