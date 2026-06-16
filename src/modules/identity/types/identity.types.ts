export type VerificationType = 'BVN' | 'NIN';

export type VerificationStatus =
  | 'PENDING'
  | 'OTP_SENT'
  | 'OTP_VERIFIED'
  | 'BIODATA_CONFIRMED'
  | 'BIODATA_RETRIEVED'
  | 'PROCESSING'
  | 'MANUAL_MODE_REQUIRED'
  | 'APPROVED'
  | 'FAILED';

export type VerifiedFields = {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
};

export type VerificationSession = {
  id: string;
  verificationType: VerificationType;
  identifierHash?: string;
  identifierMasked?: string;
  status: VerificationStatus;
  provider?: string;
  verifiedFields?: VerifiedFields;
  manualModeReason?: string;
  initiatedBy?: {
    staffId: string;
    staffName: string;
    role: string;
  };
  activateRequestId?: string;
  createdAt: string;
};

// ── Request payloads ──────────────────────────────────────────────────────────

export type StartVerificationPayload = {
  type: VerificationType;
  identifier: string;
  firstName?: string;
  lastName?: string;
};

export type VerifyCodePayload = {
  verificationId: string;
  code: string;
};

export type ConfirmBiodataPayload = {
  verificationId: string;
  email?: string;
};

export type PictureVerificationPayload = {
  verificationId: string;
  identifier: string;
  firstName: string;
  lastName: string;
  imageBase64: string;
};

export type ManualModePayload = {
  verificationId: string;
  reason: string;
};

export type RejectManualPayload = {
  reason: string;
};

// ── Response shapes ───────────────────────────────────────────────────────────

export type StartVerificationResponse = {
  verificationId: string;
  status: VerificationStatus;
  message: string;
};

export type VerifyCodeResponse = {
  verificationId: string;
  status: VerificationStatus;
  message: string;
};
