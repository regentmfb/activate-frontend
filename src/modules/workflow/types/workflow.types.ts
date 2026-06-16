export type WorkflowReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | 'LIEN_PLACED';

export type WorkflowReviewType =
  | 'ACCOUNT_OPENING'
  | 'TIER_UPGRADE'
  | 'MANUAL_VERIFICATION'
  | 'LIEN_REQUEST'
  | 'CORRECTION';

export type WorkflowReview = {
  id: string;
  requestId: string;
  customerName: string;
  accountNumber?: string;
  accountType: string;
  reviewType: WorkflowReviewType;
  submittedBy: string;
  submittedByRole: string;
  reviewerNote?: string;
  status: WorkflowReviewStatus;
  createdAt: string;
  updatedAt: string;
};

// ── Compliance Review Types ──────────────────────────────────────────────────

export type ComplianceCustomerSummary = {
  fullName: string;
  phoneNumber: string | null;
};

export type ComplianceVerificationSummary = {
  type: string;
  status: string;
};

export type ComplianceCustomerDetail = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
};

export type ComplianceVerificationDetail = {
  type: string;
  status: string;
  matchScore: number | null;
  livenessCheckPassed: boolean | null;
  livenessScore: number | null;
  bvnMasked: string | null;
  ninMasked: string | null;
};

export type ComplianceDocument = {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  rejectionReason: string | null;
  uploadedAt: string;
};

export type ComplianceReviewHistoryItem = {
  action: string;
  reviewerName: string;
  comments: string | null;
  reviewedAt: string;
};

/** Shape returned by GET /compliance/activate/accounts (list) */
export type ComplianceAccountRequest = {
  id: string;
  requestNumber: string;
  clientDraftId?: string;
  accountCategory: 'INDIVIDUAL' | 'CORPORATE';
  accountType: 'SAVINGS' | 'CURRENT';
  status: string;
  workflowStage: string;
  failureReason?: string;
  branchName?: string;
  createdAt: string;
  updatedAt: string;
  rm?: {
    staffId: string;
    staffName: string;
  };
  // Enriched fields on list items
  customer: ComplianceCustomerSummary | null;
  verification: ComplianceVerificationSummary | null;
};

/** Shape returned by GET /compliance/activate/accounts/:id (detail) */
export type ComplianceAccountDetail = {
  request: {
    id: string;
    requestNumber: string;
    accountCategory: string;
    accountType: string;
    tier: string | null;
    status: string;
    workflowStage: string;
    failureReason: string | null;
    verificationMode: string | null;
    manualModeReason: string | null;
    branchName: string | null;
    departmentName: string | null;
    bankOneAccountNumber: string | null;
    retryCount: number;
    createdAt: string;
    submittedAt: string | null;
    completedAt: string | null;
  };
  rm: {
    staffId: string;
    staffName: string;
    email: string | null;
    staffCode: string | null;
  };
  customer: ComplianceCustomerDetail | null;
  verification: ComplianceVerificationDetail | null;
  documents: ComplianceDocument[];
  reviewHistory: ComplianceReviewHistoryItem[];
};

// ── Compliance Request payloads ──────────────────────────────────────────────

export type ReviewApprovalPayload = {
  comments: string;
};

export type NonCompliantPayload = {
  reason: string;
};

export type ComplianceLienPayload = {
  accountNumber: string;
  amount: number;
  reason: string;
  requestId: string;
};

// ── Compliance Response shapes ───────────────────────────────────────────────

export type ReviewApprovalResponse = {
  id: string;
  requestNumber: string;
  status: string;
  workflowStage: string;
};

export type NonCompliantResponse = {
  id: string;
  requestNumber: string;
  status: string;
  failureReason: string;
};

export type ComplianceLienResponse = {
  success: boolean;
  reference: string;
  message: string;
};

// ── Compliance UI types ──────────────────────────────────────────────────────

export type ComplianceAction = 'APPROVE' | 'REJECT' | 'PLACE_LIEN';

export type ComplianceReviewFormData = {
  comments: string;
};

export type NonCompliantFormData = {
  reason: string;
};

export type UpdateComplianceAccountPayload = {
  accountCategory?: 'INDIVIDUAL' | 'CORPORATE';
  accountType?: 'SAVINGS' | 'CURRENT';
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  bvn?: string;
  nin?: string;
};
