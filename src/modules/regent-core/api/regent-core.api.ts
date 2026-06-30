import apiClient from '@/src/lib/api-client';

export interface AccountDetails {
  primaryInfo: string;
  customerName: string;
  officerName: string;
}

export interface FailedSyncRecord {
  resourceId: string;
  resourceType: string;
  failedAt: string;
  reason: string;
  accountDetails?: AccountDetails;
}

export interface SuccessfulSyncRecord {
  resourceId: string;
  resourceType: string;
  syncedAt: string;
  accountDetails?: AccountDetails;
}

export interface SyncRetryResponse {
  totalFailedFound: number;
  processed: number;
  succeeded: number;
  failed: number;
  details: Array<{
    resourceId: string;
    resourceType: string;
    status: 'success' | 'failed';
    reason?: string;
  }>;
}

const http = apiClient;

export const regentCoreApi = {
  /** Get the list of failed account openings and upgrades that need to be synced */
  getFailedSyncs: async (): Promise<FailedSyncRecord[]> => {
    const { data } = await http.get<{ data: FailedSyncRecord[] }>('/activate/regent-core/sync-failed');
    return data.data ?? data;
  },

  /** Get the list of recently successful account openings and upgrades that were synced */
  getSuccessfulSyncs: async (): Promise<SuccessfulSyncRecord[]> => {
    const { data } = await http.get<{ data: SuccessfulSyncRecord[] }>('/activate/regent-core/sync-success');
    return data.data ?? data;
  },

  /** Retry syncing failed account openings and upgrades to Regent Core */
  retryFailedSyncs: async (): Promise<SyncRetryResponse> => {
    const { data } = await http.post<{ data: SyncRetryResponse }>('/activate/regent-core/sync-failed');
    return data.data ?? data;
  },
};
