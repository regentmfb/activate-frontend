// ── Request payloads ──────────────────────────────────────────────────────────

export type PlaceLienPayload = {
  accountNumber: string;
  amount: number;
  reason: string;
  requestId: string;
};

export type ReleaseLienPayload = {
  accountNumber: string;
};

// ── Lien Request workflow types ───────────────────────────────────────────────

export type LienRequestStatus =
  | 'PENDING_TEAM_LEAD'
  | 'PENDING_TEAM_LEAD_REVIEW'
  | 'PENDING_CMO'
  | 'PENDING_CMO_REVIEW'
  | 'PENDING_OPERATIONS'
  | 'PLACED'
  | 'APPROVED'
  | 'REJECTED';

export type LienRequest = {
  id: string;
  accountNumber: string;
  amount: number;
  reason: string;
  customerId?: string;
  customerName?: string;
  status: LienRequestStatus;
  submittedBy: string;
  submittedByRole: string;
  teamLeadComment?: string;
  cmoComment?: string;
  operationsComment?: string;
  rejectedBy?: string;
  rejectionReason?: string;
  reference?: string;
  createdAt: string;
  updatedAt: string;
  supportingDocuments?: Array<{ fileName: string; url: string }> | null;
  customerDetails?: {
    bvnMasked?: string | null;
    ninMasked?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    gender?: string | null;
    dateOfBirth?: string | null;
  };
  accountDetails?: {
    accountCategory?: string;
    requestNumber?: string;
  };
  reviewHistory?: Array<{
    reviewerName: string;
    reviewerRole: string;
    action: string;
    comments: string;
    timestamp: string;
  }>;
};

export type LienRequestsResponse = {
  requests: LienRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type SubmitLienRequestPayload = {
  accountId: string;
  customerId: string;
  amount: number;
  reason: string;
  supportingDocuments: Array<{
    fileName: string;
    url: string;
  }>;
};

export type ReviewLienRequestPayload = {
  action: 'APPROVE' | 'REJECT';
  comments?: string;
  rejectionReason?: string;
};

export type PlaceLienOperationsPayload = {
  requestId: string;
  revealToken: string;
};

// ── Response shapes ───────────────────────────────────────────────────────────

export type ActiveLien = {
  id: string;
  accountNumber: string;
  amount: number;
  reason: string;
  requestId: string;
  reference: string;
  placedBy: string;
  placedAt: string;
};

export type ActiveLiensResponse = {
  liens: ActiveLien[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type PlaceLienResponse = {
  success: boolean;
  reference: string;
  message: string;
};

export type ReleaseLienResponse = {
  success: boolean;
  message: string;
};

// ── UI types ──────────────────────────────────────────────────────────────────

export type LienFormData = {
  accountNumber: string;
  amount: string; // String for form input, converted to number in API call
  reason: string;
};

export type LienOperation = 'PLACE' | 'RELEASE';

export type LienStatus = 'IDLE' | 'PLACING' | 'RELEASING' | 'SUCCESS' | 'ERROR';