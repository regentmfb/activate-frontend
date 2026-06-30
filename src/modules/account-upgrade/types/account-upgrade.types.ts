export type UpgradeStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'MANUAL_REVIEW'
  | 'CANCELLED';

export type TierUpgradeRecord = {
  id: string;
  activateRequestId: string;
  accountNumber?: string;
  customerId?: string;
  customerName?: string;
  fromTier: number;
  toTier: number;
  status: UpgradeStatus;
  failureReason?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string | null;
};

export type TierUpgradeListResponse = {
  data: TierUpgradeRecord[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// ── Tier 2 payload ────────────────────────────────────────────────────────────

export type Tier2UpgradePayload = {
  bvn?: string;
  nin?: string;
  idCardDocumentId: string;
  hasConsent: boolean;
};

// ── Tier 3 payload ────────────────────────────────────────────────────────────

export type Tier3UpgradePayload = {
  address: {
    houseNumber: string;
    street: string;
    landmark?: string;
    city: string;
    lga: string;
    state: string;
    country?: string;
  };
  proofOfAddressDocumentId: string;
  customerLocationImageId: string;
};
