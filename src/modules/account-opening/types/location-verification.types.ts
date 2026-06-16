export type SubmitLocationVerificationPayload = {
  address: string;
  proofOfAddressDocumentId: string;
  customerLocationImageId: string;
  isNearby: boolean;
  rmLatitude: number;
  rmLongitude: number;
  customerLatitude: number;
  customerLongitude: number;
};

export type LocationVerificationRecord = {
  id: string;
  status?: string;
  address?: string;
  isNearby?: boolean;
  // We'll leave the rest generic until the backend fully defines the shape
  [key: string]: unknown;
};

export type LocationManualReviewPayload = {
  status: 'APPROVED' | 'REJECTED';
  reason: string;
};
