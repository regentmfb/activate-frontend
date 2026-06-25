// ── Reference types ───────────────────────────────────────────────────────────

export type ReferenceStatus = 'PENDING' | 'PASSED' | 'FAILED' | 'UNDER_REVIEW';

export type ReferenceCustomer = {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  verificationType: string;
  identifierMasked: string;
};

export type ReferenceAccountRequest = {
  id: string;
  requestNumber: string;
  accountCategory: string;
  accountType: string;
  tier: string;
  status: string;
  rm: {
    staffId: string;
    staffName: string;
    role: string;
    email: string;
  };
  createdAt: string;
};

export type ReferenceRecord = {
  id: string;
  activateRequestId: string;
  fullName: string;
  bankName: string;
  accountNumber: string;
  email: string;
  phoneNumber: string;
  documentUrl: string;
  status: ReferenceStatus;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  accountRequest: ReferenceAccountRequest;
  customer: ReferenceCustomer;
};

export type Reference = {
  fullName: string;
  bankName: string;
  accountNumber: string;
  email: string;
  phoneNumber: string;
  documentUrl: string;
};

// ── Request payloads ──────────────────────────────────────────────────────────

export type SubmitReferencesPayload = {
  documentUrl?: string;
  references?: Reference[];
};

export type FailReferencePayload = {
  reason: string;
};

export type ResubmitReferencePayload = {
  fullName: string;
  bankName: string;
  accountNumber: string;
  email: string;
  phoneNumber: string;
  documentUrl: string;
};

// ── Response shapes ───────────────────────────────────────────────────────────

export type SubmitReferencesResponse = {
  success: boolean;
  message: string;
  referencesCount?: number;
};

export type PassReferenceResponse = {
  success: boolean;
  message: string;
  autoTriggeredCBA?: boolean;
};

export type FailReferenceResponse = {
  success: boolean;
  message: string;
  taskCreated: boolean;
};

// ── UI types ──────────────────────────────────────────────────────────────────

export type ReferenceFormData = {
  fullName: string;
  bankName: string;
  accountNumber: string;
  email: string;
  phoneNumber: string;
  documentUrl: string;
};

export type ReferenceAction = 'PASS' | 'FAIL';

export type ReferenceValidationErrors = {
  [key: string]: string;
};
