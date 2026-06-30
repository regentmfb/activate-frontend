import { VerificationMethod } from './account-opening.types';

export type WizardStep =
  | 'IDENTITY_INPUT'
  | 'OTP_VERIFICATION'
  | 'FACE_PROCESSING'
  | 'BIODATA_CONFIRMATION'
  | 'LIVENESS_CHECK'
  | 'PHOTO_CAPTURE'
  | 'TIER1_SUCCESS'
  | 'TIER1_FAILED'
  | 'TIER2_UPGRADE'
  | 'TIER2_SUCCESS'
  | 'TIER2_FAILED'
  | 'TIER3_UPGRADE'
  | 'TIER3_SUCCESS'
  | 'TIER3_FAILED'
  | 'COMPLETE';

export type Biodata = {
  firstName: string;
  lastName: string;
  middleName?: string;
  dob: string;
  gender: string;
  phone: string;
  email?: string;
  address?: string;
  nin?: string;
  bvn?: string;
};

export type CurrentWizardStep =
  | 'IDENTITY_INPUT'
  | 'OTP_VERIFICATION'
  | 'FACE_PROCESSING'
  | 'BIODATA_CONFIRMATION'
  | 'LIVENESS_CHECK'
  | 'PHOTO_CAPTURE'
  | 'REFERENCE_UPLOAD'
  | 'TIER1_SUCCESS'
  | 'TIER1_FAILED'
  | 'TIER2_UPGRADE'
  | 'TIER2_SUCCESS'
  | 'TIER2_FAILED'
  | 'TIER3_UPGRADE'
  | 'TIER3_SUCCESS'
  | 'TIER3_FAILED'
  | 'COMPLETE';

export type IndividualCurrentFormState = {
  clientReference: string;
  verificationMethod: VerificationMethod;
  firstName: string;
  lastName: string;
  identityValue: string;
  otpValue: string;
  verificationId: string | null;
  biodata: Biodata | null;
  customerPhotoUrl: string | null;
  livenessPhotoUrl: string | null;
  // Tier 1 Extension
  referenceFormUrl: string | null;
  // Tier 2
  secondaryIdMethod: string | null;
  secondaryIdValue: string;
  idCardPhotoUrl: string | null;
  // Tier 3
  isProximityConfirmed: boolean | null;
  streetNumber?: string;
  streetName?: string;
  lga?: string;
  city?: string;
  state?: string;
  landmark?: string;
  description?: string;
  address: any;
  proofOfAddressUrl: string | null;
  proofOfAddressFile?: File | null;
  locationPhotoUrl: string | null;
  locationPhotoFile?: File | null;
  gpsCoords: { lat: number; lng: number } | null;
  // Result
  accountRequestId: string | null;
  accountNumber: string | null;
};

export type IndividualSavingsFormState = {
  clientReference: string;
  verificationMethod: VerificationMethod;
  firstName: string;
  lastName: string;
  identityValue: string;
  otpValue: string;
  verificationId: string | null;
  biodata: Biodata | null;
  customerPhotoUrl: string | null;
  livenessPhotoUrl: string | null;
  // Tier 2
  secondaryIdMethod: string | null;
  secondaryIdValue: string;
  idCardPhotoUrl: string | null;
  // Tier 3
  isProximityConfirmed: boolean | null;
  streetNumber?: string;
  streetName?: string;
  lga?: string;
  city?: string;
  state?: string;
  landmark?: string;
  description?: string;
  address: any;
  proofOfAddressUrl: string | null;
  proofOfAddressFile?: File | null;
  locationPhotoUrl: string | null;
  locationPhotoFile?: File | null;
  gpsCoords: { lat: number; lng: number } | null;
  // Result
  accountRequestId: string | null;
  accountNumber: string | null;
};
