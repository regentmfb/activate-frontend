import { AccountType } from '@/src/modules/account-opening/types/account-opening.types';

export type TaskStatus =
  | 'PENDING_ACTION'
  | 'PENDING_UPLOAD'
  | 'PENDING_VERIFICATION'
  | 'PENDING_REVIEW'
  | 'FAILED_RETRYABLE'
  | 'FAILED_MANUAL_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskType =
  | 'REJECTED_ACCOUNT_CORRECTION'
  | 'TIER_2_PENDING'
  | 'TIER_3_PENDING'
  | 'PICTURE_UPLOAD_PENDING'
  | 'MANUAL_REVIEW_REQUIRED'
  | 'MOBILE_ONBOARDING_PENDING'
  | 'DEPOSIT_FOLLOWUP'
  | 'REFERENCE_CORRECTION'
  | 'COMPLIANCE_REVIEW'
  | 'DOCUMENT_VERIFICATION'
  | 'CUSTOMER_FOLLOWUP'
  | string;

// ── API shape ─────────────────────────────────────────────────────────────────

export type ApiTask = {
  id: string;
  activateRequestId: string | null;
  customerId: string | null;
  customerName?: string; // Backend returns this
  accountCategory?: string;
  accountType?: string;
  assignedTo?: {
    staffId: string;
    staffName: string;
  };
  assignedBy?: {
    staffId: string;
    staffName: string;
  };
  taskType: TaskType;
  title: string;
  description: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueAt?: string | null;
  createdAt: string;
  completedAt?: string | null;
  cancelledAt?: string | null;
  updatedAt: string;
  startedAt?: string;
  assignedAt?: string;
  escalatedAt?: string;
  escalationReason?: string | null;
  identityVerificationId?: string | null;
  request?: any;
  customer?: any;
  verification?: any;
  documents?: any[];
};

// ── Internal UI shape (kept for component compatibility) ──────────────────────

export type Task = {
  id: string;
  customerName: string;
  accountType: AccountType;
  accountNumber?: string;
  clientReference?: string;
  status: TaskStatus;
  priority: TaskPriority;
  updatedAt: string;
  createdAt?: string;
  requestId: string;
  // Real API fields
  title?: string;
  description?: string;
  taskType?: TaskType;
  customerId?: string;
  activateRequestId?: string;
  // Enhanced fields
  assignedTo?: {
    staffId: string;
    staffName: string;
  };
  assignedBy?: {
    staffId: string;
    staffName: string;
  };
  startedAt?: string;
  assignedAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
  request?: any;
  customer?: any;
  verification?: any;
  documents?: any[];
};
