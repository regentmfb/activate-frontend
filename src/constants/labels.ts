/**
 * Central label/config constants used across the app.
 * Import from here instead of defining locally in components.
 */

import type { PinVerificationReason } from '@src/modules/pin/types/pin.types';

// ── Account types ─────────────────────────────────────────────────────────────

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_SAVINGS: 'Individual Savings',
  INDIVIDUAL_CURRENT: 'Individual Current',
  TARGET_SAVINGS:     'Target Savings',
  KIDDIES_SAVINGS:    'Kiddies Savings',
  FIXED_DEPOSIT:      'Fixed Deposit',
  CORPORATE_SAVINGS:  'Corporate Savings',
  CORPORATE_CURRENT:  'Corporate Current',
};

// ── Staff roles ───────────────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  RM:               'Relationship Manager',
  TEAM_LEAD:        'Team Lead',
  CMO:              'CMO',
  MD:               'MD',
  OPERATIONS:       'Operations',
  INTERNAL_CONTROL: 'Internal Control',
  TELLER:           'Teller',
  ACCOUNT_OFFICER:  'Account Officer',
  SUPER_ADMIN:      'Super Admin',
};

export const ROLE_COLORS: Record<string, string> = {
  RM:               'bg-purple-50 text-[#920793]',
  TEAM_LEAD:        'bg-blue-50 text-blue-600',
  CMO:              'bg-amber-50 text-amber-600',
  MD:               'bg-indigo-50 text-indigo-600',
  OPERATIONS:       'bg-green-50 text-green-600',
  INTERNAL_CONTROL: 'bg-red-50 text-red-600',
  TELLER:           'bg-gray-100 text-gray-600',
  ACCOUNT_OFFICER:  'bg-teal-50 text-teal-600',
  SUPER_ADMIN:      'bg-purple-100 text-[#920793]',
};

// ── Task statuses ─────────────────────────────────────────────────────────────

export const TASK_STATUS_LABELS: Record<string, string> = {
  PENDING_ACTION:        'Pending Action',
  PENDING_UPLOAD:        'Pending Upload',
  PENDING_VERIFICATION:  'Pending Verification',
  PENDING_REVIEW:        'Pending Review',
  FAILED_RETRYABLE:      'Failed (Retryable)',
  FAILED_MANUAL_REVIEW:  'Failed (Manual Review)',
  COMPLETED:             'Completed',
  CANCELLED:             'Cancelled',
  // Legacy task type labels (for backward compatibility)
  TIER_2_PENDING:            'Tier 2 Upgrade Pending',
  TIER_3_PENDING:            'Tier 3 Upgrade Pending',
  PICTURE_UPLOAD_PENDING:    'Picture Upload Pending',
  MANUAL_REVIEW_REQUIRED:    'Manual Review Required',
  FAILED_VERIFICATION:       'Verification Failed',
  CORRECTION_REQUESTED:      'Correction Requested',
  REJECTED_ACCOUNT_CORRECTION: 'Rejected — Needs Correction',
  REFERENCE_FAILED:          'Reference Failed',
  MIDDLEWARE_FAILED:         'Processing Failed',
  MOBILE_ONBOARDING_PENDING: 'Mobile Onboarding Pending',
  DEPOSIT_FOLLOWUP:          'Deposit Follow-up',
};

export const TASK_PRIORITY_STYLES: Record<string, string> = {
  URGENT: 'bg-red-600 text-white border border-red-700',
  HIGH:   'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW:    'bg-blue-100 text-blue-700 border border-blue-200',
};

// ── Workflow statuses ─────────────────────────────────────────────────────────

export const WORKFLOW_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  PENDING:  { label: 'Pending',  cls: 'bg-amber-50 text-amber-600' },
  APPROVED: { label: 'Approved', cls: 'bg-green-50 text-green-600' },
  REJECTED: { label: 'Rejected', cls: 'bg-red-50 text-red-600' },
};

// ── Account opening wizard ────────────────────────────────────────────────────

export const SAVINGS_STEP_LABELS: Record<string, string> = {
  IDENTITY_INPUT:    'Identity',
  OTP_VERIFICATION:  'Face Verification',
  FACE_PROCESSING:   'Face Match',
  BIODATA_CONFIRMATION: 'Biodata',
  LIVENESS_CHECK:    'Face Verification',
  PHOTO_CAPTURE:     'Photo',
  TIER1_SUCCESS:     'Tier 1',
  TIER1_FAILED:      'Tier 1',
  TIER2_UPGRADE:     'Tier 2',
  TIER2_SUCCESS:     'Tier 2',
  TIER2_FAILED:      'Tier 2',
  TIER3_UPGRADE:     'Tier 3',
  TIER3_SUCCESS:     'Tier 3',
  TIER3_FAILED:      'Tier 3',
  COMPLETE:          'Done',
};

export const SAVINGS_STEP_DESCRIPTIONS: Record<string, string> = {
  IDENTITY_INPUT:       "Enter the customer's BVN, NIN, or capture their face to begin.",
  OTP_VERIFICATION:     "Verify the customer's identity with a live facial scan.",
  FACE_PROCESSING:      'Matching face against national database…',
  BIODATA_CONFIRMATION: 'Review and confirm the customer details.',
  LIVENESS_CHECK:       'Run face verification.',
  PHOTO_CAPTURE:        'Take a clear photo of the customer.',
  TIER1_SUCCESS:        'Tier 1 account created successfully.',
  TIER1_FAILED:         'Tier 1 account creation failed.',
  TIER2_UPGRADE:        'Provide secondary ID and ID card photo.',
  TIER2_SUCCESS:        'Tier 2 upgrade successful.',
  TIER2_FAILED:         'Tier 2 upgrade failed.',
  TIER3_UPGRADE:        'Verify customer address and location.',
  TIER3_SUCCESS:        'Tier 3 upgrade successful.',
  TIER3_FAILED:         'Tier 3 upgrade failed.',
  COMPLETE:             'Account setup is complete.',
};

export const SAVINGS_RESULT_STEPS = new Set([
  'TIER1_SUCCESS', 'TIER1_FAILED',
  'TIER2_SUCCESS', 'TIER2_FAILED',
  'TIER3_SUCCESS', 'TIER3_FAILED',
  'COMPLETE',
]);

export const CURRENT_STEP_LABELS: Record<string, string> = {
  IDENTITY_INPUT:       'Identity',
  OTP_VERIFICATION:     'Face Verification',
  FACE_PROCESSING:      'Face Match',
  BIODATA_CONFIRMATION: 'Biodata',
  LIVENESS_CHECK:       'Face Verification',
  PHOTO_CAPTURE:        'Photo',
  REFERENCE_UPLOAD:     'Reference',
  TIER1_SUCCESS:        'Tier 1',
  TIER1_FAILED:         'Tier 1',
  TIER2_UPGRADE:        'Tier 2',
  TIER2_SUCCESS:        'Tier 2',
  TIER2_FAILED:         'Tier 2',
  TIER3_UPGRADE:        'Tier 3',
  TIER3_SUCCESS:        'Tier 3',
  TIER3_FAILED:         'Tier 3',
  COMPLETE:             'Done',
};

export const CURRENT_STEP_DESCRIPTIONS: Record<string, string> = {
  IDENTITY_INPUT:       "Enter the customer's BVN, NIN, or capture their face to begin.",
  OTP_VERIFICATION:     "Verify the customer's identity with a live facial scan.",
  FACE_PROCESSING:      'Matching face against national database…',
  BIODATA_CONFIRMATION: 'Review and confirm the customer details.',
  LIVENESS_CHECK:       'Run face verification.',
  PHOTO_CAPTURE:        'Take a clear photo of the customer.',
  REFERENCE_UPLOAD:     'Upload the signed reference form.',
  TIER1_SUCCESS:        'Tier 1 account created successfully.',
  TIER1_FAILED:         'Tier 1 account creation failed.',
  TIER2_UPGRADE:        'Provide secondary ID and ID card photo.',
  TIER2_SUCCESS:        'Tier 2 upgrade successful.',
  TIER2_FAILED:         'Tier 2 upgrade failed.',
  TIER3_UPGRADE:        'Verify customer address and location.',
  TIER3_SUCCESS:        'Tier 3 upgrade successful.',
  TIER3_FAILED:         'Tier 3 upgrade failed.',
  COMPLETE:             'Account setup is complete.',
};

export const CURRENT_RESULT_STEPS = new Set([
  'TIER1_SUCCESS', 'TIER1_FAILED',
  'TIER2_SUCCESS', 'TIER2_FAILED',
  'TIER3_SUCCESS', 'TIER3_FAILED',
  'COMPLETE',
]);

// ── Account request status ────────────────────────────────────────────────────

export const ACCOUNT_REQUEST_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  TIER_2_PENDING:            { label: 'Tier 2 Upgrade Pending',    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200'   },
  TIER_3_PENDING:            { label: 'Tier 3 Upgrade Pending',    color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200'   },
  PICTURE_UPLOAD_PENDING:    { label: 'Picture Upload Pending',    color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'     },
  MANUAL_REVIEW_REQUIRED:    { label: 'Manual Review Required',    color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  FAILED_VERIFICATION:       { label: 'Verification Failed',       color: 'text-red-600',    bg: 'bg-red-50 border-red-200'       },
  CORRECTION_REQUESTED:      { label: 'Correction Requested',      color: 'text-red-600',    bg: 'bg-red-50 border-red-200'       },
  REFERENCE_FAILED:          { label: 'Reference Failed',          color: 'text-red-600',    bg: 'bg-red-50 border-red-200'       },
  MIDDLEWARE_FAILED:         { label: 'Processing Failed',         color: 'text-red-600',    bg: 'bg-red-50 border-red-200'       },
  MOBILE_ONBOARDING_PENDING: { label: 'Mobile Onboarding Pending', color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'     },
  DEPOSIT_FOLLOWUP:          { label: 'Deposit Follow-up',         color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200'     },
  ACTIVE:                    { label: 'Active',                    color: 'text-green-600',  bg: 'bg-green-50 border-green-200'   },
  SUBMITTED:                 { label: 'Submitted',                 color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'     },
  COMPLETED:                 { label: 'Completed',                 color: 'text-green-600',  bg: 'bg-green-50 border-green-200'   },
  FAILED:                    { label: 'Failed',                    color: 'text-red-600',    bg: 'bg-red-50 border-red-200'       },
  CANCELLED:                 { label: 'Cancelled',                 color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200'     },
};

// ── PIN verification ──────────────────────────────────────────────────────────

export const PIN_REASON_MESSAGES: Record<PinVerificationReason, string> = {
  VIEW_PORTFOLIO_VALUE:    'Enter your PIN to view portfolio value',
  VIEW_CUSTOMER_BIODATA:   'Enter your PIN to view customer biodata',
  OPEN_ACCOUNT:            'Enter your PIN to open account',
  SUBMIT_ACCOUNT_OPENING:  'Enter your PIN to submit account opening',
  UPGRADE_ACCOUNT:         'Enter your PIN to upgrade account',
  VIEW_BALANCE:            'Enter your PIN to view balance',
  SUBMIT_LOAN_APPLICATION: 'Enter your PIN to submit loan application',
  APPROVE_WORKFLOW:        'Enter your PIN to approve workflow',
  REJECT_WORKFLOW:         'Enter your PIN to reject workflow',
  PLACE_LIEN:              'Enter your PIN to place lien',
  REMOVE_LIEN:             'Enter your PIN to remove lien',
  RETRY_FAILED_ACTION:     'Enter your PIN to retry action',
};

// ── Compliance workflow ───────────────────────────────────────────────────────

export const COMPLIANCE_STATUS_LABELS: Record<string, string> = {
  PENDING:  'Pending Review',
  REVIEWED: 'Reviewed',
  REJECTED: 'Rejected',
};

export const COMPLIANCE_WORKFLOW_STAGE_LABELS: Record<string, string> = {
  COMPLIANCE_REVIEW: 'Compliance Review',
  COMPLETED_REVIEW:  'Review Complete',
  NON_COMPLIANT:     'Non-Compliant',
};

// ── Document types ────────────────────────────────────────────────────────────

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  CUSTOMER_PHOTO:    'Customer Photo',
  ID_CARD_PHOTO:     'ID Card Photo',
  PROOF_OF_ADDRESS:  'Proof of Address',
  LOCATION_PHOTO:    'Location Photo',
  REFERENCE_FORM:    'Reference Form',
  SIGNATURE:         'Signature',
  UTILITY_BILL:      'Utility Bill',
  BANK_STATEMENT:    'Bank Statement',
  EMPLOYMENT_LETTER: 'Employment Letter',
  OTHER:             'Document',
};

// ── Reference status ──────────────────────────────────────────────────────────

export const REFERENCE_STATUS_LABELS: Record<string, string> = {
  PENDING:      'Pending Review',
  PASSED:       'Approved',
  FAILED:       'Rejected',
  UNDER_REVIEW: 'Under Review',
};
