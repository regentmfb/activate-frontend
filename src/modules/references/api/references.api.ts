import apiClient from '@/src/lib/api-client';
import type {
  SubmitReferencesPayload,
  FailReferencePayload,
  SubmitReferencesResponse,
  PassReferenceResponse,
  FailReferenceResponse,
  ReferenceRecord,
  ResubmitReferencePayload,
} from '../types/references.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  status: string;
  data: T;
};

const http = apiClient;

export const referencesApi = {
  // ── Submit references for account opening ─────────────────────────────────────

  submitReferences: async (accountId: string, payload: SubmitReferencesPayload): Promise<SubmitReferencesResponse> => {
    const { data } = await http.post<ApiEnvelope<SubmitReferencesResponse>>(
      `/activate/accounts/${accountId}/references`,
      payload
    );
    return data.data ?? data;
  },

  // ── Get all pending references (Operations view) ──────────────────────────────

  getPendingReferences: async (): Promise<ReferenceRecord[]> => {
    const { data } = await http.get<ApiEnvelope<ReferenceRecord[]>>(
      '/activate/references/pending-review'
    );
    return data.data ?? [];
  },

  // ── Get references filtered by status ────────────────────────────────────────

  getReferencesByStatus: async (status?: 'PENDING' | 'PASSED' | 'FAILED'): Promise<ReferenceRecord[]> => {
    const url = status
      ? `/activate/references?status=${status}`
      : '/activate/references';
    const { data } = await http.get<ApiEnvelope<ReferenceRecord[]>>(url);
    return data.data ?? [];
  },

  // ── Get references by account request ID ──────────────────────────────────────

  getReferencesByAccountId: async (accountId: string): Promise<ReferenceRecord[]> => {
    try {
      const { data } = await http.get<ApiEnvelope<ReferenceRecord[]>>(
        `/activate/accounts/${accountId}/references`
      );
      return data.data ?? [];
    } catch {
      return [];
    }
  },

  // ── Operations: approve reference ────────────────────────────────────────────

  passReference: async (referenceId: string): Promise<PassReferenceResponse> => {
    const { data } = await http.post<ApiEnvelope<PassReferenceResponse>>(
      `/activate/references/${referenceId}/pass`
    );
    return data.data;
  },

  // ── Operations: reject reference ─────────────────────────────────────────────

  failReference: async (referenceId: string, payload: FailReferencePayload): Promise<FailReferenceResponse> => {
    const { data } = await http.post<ApiEnvelope<FailReferenceResponse>>(
      `/activate/references/${referenceId}/fail`,
      payload
    );
    return data.data;
  },

  resubmitReference: async (referenceId: string, payload: ResubmitReferencePayload): Promise<{ success: boolean; message: string }> => {
    const { data } = await http.post<ApiEnvelope<{ success: boolean; message: string }>>(
      `/activate/references/${referenceId}/resubmit`,
      payload
    );
    return data.data ?? data;
  },
};
