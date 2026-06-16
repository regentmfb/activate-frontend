export type AccountType =
  | 'INDIVIDUAL_SAVINGS'
  | 'INDIVIDUAL_CURRENT'
  | 'TARGET_SAVINGS'
  | 'KIDDIES_SAVINGS'
  | 'FIXED_DEPOSIT'
  | 'CORPORATE_SAVINGS'
  | 'CORPORATE_CURRENT';

export type AccountTier = 1 | 2 | 3;

export type VerificationMethod = 'BVN' | 'NIN' | 'FACE' | 'MANUAL';

export type OfflineFileReference = {
  fieldName: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
};

export type OfflineDraft = {
  clientReference: string;
  staffId: string;
  type: 'ACCOUNT_OPENING' | 'ACCOUNT_UPGRADE' | 'LOAN_APPLICATION';
  payload: Record<string, unknown>;
  files?: OfflineFileReference[];
  syncStatus: 'DRAFT' | 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
};

export type AccountOpeningRequest = {
  id: string;
  clientReference: string;
  accountType: AccountType;
  staffId: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'MANUAL_REVIEW';
  tier: AccountTier;
  createdAt: string;
};
