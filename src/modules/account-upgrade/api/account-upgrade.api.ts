import apiClient from '@/src/lib/api-client';
import type {
  Tier2UpgradePayload,
  Tier3UpgradePayload,
  TierUpgradeRecord,
  TierUpgradeListResponse,
} from '../types/account-upgrade.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  status: string;
  data: T;
};

const http = apiClient;

export const accountUpgradeApi = {
  /**
   * POST /activate/accounts/{id}/tier-two
   * Submit Tier 2 upgrade for a savings account
   */
  submitTier2: async (activateRequestId: string, payload: Tier2UpgradePayload): Promise<TierUpgradeRecord> => {
    const { data } = await http.post<ApiEnvelope<TierUpgradeRecord>>(
      `/activate/accounts/${activateRequestId}/tier-two`,
      payload
    );
    return data.data;
  },

  /**
   * POST /activate/accounts/{id}/tier-three
   * Submit Tier 3 upgrade for a savings account
   */
  submitTier3: async (activateRequestId: string, payload: Tier3UpgradePayload): Promise<TierUpgradeRecord> => {
    const { data } = await http.post<ApiEnvelope<TierUpgradeRecord>>(
      `/activate/accounts/${activateRequestId}/tier-three`,
      payload
    );
    return data.data;
  },

  /**
   * GET /activate/tier-upgrades
   * List all tier upgrades with optional status filter and pagination
   */
  getUpgrades: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<TierUpgradeListResponse> => {
    const { data } = await http.get<ApiEnvelope<TierUpgradeListResponse>>(
      '/activate/tier-upgrades',
      { params }
    );
    return data.data;
  },

  /**
   * GET /activate/tier-upgrades/{id}
   * Fetch a single upgrade request by its Tier Upgrade Record UUID
   */
  getUpgradeById: async (id: string): Promise<TierUpgradeRecord> => {
    const { data } = await http.get<ApiEnvelope<TierUpgradeRecord>>(
      `/activate/tier-upgrades/${id}`
    );
    return data.data;
  },

  /**
   * POST /activate/tier-upgrades/{id}/retry
   * Retry a failed upgrade request
   */
  retryUpgrade: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await http.post<ApiEnvelope<{ success: boolean; message: string }>>(
      `/activate/tier-upgrades/${id}/retry`
    );
    return data.data;
  },
};
