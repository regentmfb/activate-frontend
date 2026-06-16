import apiClient from '@/src/lib/api-client';
import type { 
  SubmitLocationVerificationPayload, 
  LocationVerificationRecord, 
  LocationManualReviewPayload 
} from '../types/location-verification.types';

type ApiEnvelope<T = void> = {
  success: boolean;
  statusCode: number;
  data: T;
};

const http = apiClient;

export const locationVerificationApi = {
  /**
   * Submit Location & Proximity Verification
   */
  submitLocationVerification: async (accountId: string, payload: SubmitLocationVerificationPayload): Promise<void> => {
    await http.post<ApiEnvelope>(`/activate/accounts/${accountId}/location-verification`, payload);
  },

  /**
   * Get details of a location verification record
   */
  getLocationVerification: async (id: string): Promise<LocationVerificationRecord> => {
    const { data } = await http.get<ApiEnvelope<LocationVerificationRecord>>(`/activate/location-verifications/${id}`);
    return data.data;
  },

  /**
   * Get latest location verification record by request ID
   */
  getLatestByRequest: async (requestId: string): Promise<LocationVerificationRecord> => {
    const { data } = await http.get<ApiEnvelope<LocationVerificationRecord>>(`/activate/location-verifications/request/${requestId}`);
    return data.data;
  },

  /**
   * Operations manual review of a pending location check
   */
  submitManualReview: async (id: string, payload: LocationManualReviewPayload): Promise<void> => {
    await http.post<ApiEnvelope>(`/activate/location-verifications/${id}/manual-review`, payload);
  },

  /**
   * List location verifications by status
   */
  listVerifications: async (params: {
    status: 'pending' | 'approved' | 'rejected';
    page: number;
    limit: number;
  }): Promise<{ items: LocationVerificationRecord[]; total: number }> => {
    const { data } = await http.get<ApiEnvelope<{ items: LocationVerificationRecord[]; total: number }>>(
      `/activate/location-verifications`,
      { params }
    );
    return data.data;
  },
};
