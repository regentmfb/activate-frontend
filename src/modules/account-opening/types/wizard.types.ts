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
  | 'ADDITIONAL_INFO'
  | 'PHOTO_CAPTURE'
  | 'ID_CARD_CAPTURE'
  | 'LOCATION_VERIFICATION'
  | 'REFERENCE_UPLOAD'
  | 'SUBMIT_SUCCESS'
  | 'SUBMIT_FAILED'
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
  // Additional info
  email: string;
  secondPhone: string;
  secondaryIdMethod: VerificationMethod | null;
  secondaryIdValue: string;
  address: string;
  // Uploads
  customerPhotoUrl: string | null;
  livenessPhotoUrl: string | null;
  idCardPhotoUrl: string | null;
  // Location
  isProximityConfirmed: boolean | null;
  proofOfAddressUrl: string | null;
  locationPhotoUrl: string | null;
  proofOfAddressFile: File | null;       // actual File for upload
  locationPhotoFile: File | null;        // actual File for upload
  gpsCoords: { lat: number; lng: number } | null;
  // Reference
  referenceFormUrl: string | null;
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
  secondaryIdMethod: VerificationMethod | null;
  secondaryIdValue: string;
  idCardPhotoUrl: string | null;
  // Tier 3
  isProximityConfirmed: boolean | null;
  address: string;
  proofOfAddressUrl: string | null;
  locationPhotoUrl: string | null;
  gpsCoords: { lat: number; lng: number } | null;
  // Result
  accountRequestId: string | null;
  accountNumber: string | null;
};
