import apiClient from '@/src/lib/api-client';
import type {
  StartVerificationPayload,
  StartVerificationResponse,
  VerifyCodePayload,
  VerifyCodeResponse,
  ConfirmBiodataPayload,
  PictureVerificationPayload,
  ManualModePayload,
  RejectManualPayload,
  VerificationSession,
} from '../types/identity.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

const http = apiClient;

export const identityApi = {
  start: async (payload: StartVerificationPayload): Promise<StartVerificationResponse> => {
    const { data } = await http.post<ApiEnvelope<StartVerificationResponse>>('/identity/start', payload);
    return data.data;
  },

  verifyCode: async (payload: VerifyCodePayload): Promise<VerifyCodeResponse> => {
    const { data } = await http.post<ApiEnvelope<VerifyCodeResponse>>('/identity/verify-code', payload);
    return data.data;
  },

  confirmBiodata: async (payload: ConfirmBiodataPayload): Promise<VerificationSession> => {
    const { data } = await http.post<ApiEnvelope<VerificationSession>>('/identity/confirm-biodata', payload);
    return data.data;
  },

  pictureVerification: async (payload: PictureVerificationPayload): Promise<StartVerificationResponse> => {
    const { data } = await http.post<ApiEnvelope<StartVerificationResponse>>('/identity/picture-verification', payload);
    return data.data;
  },

  switchToManual: async (payload: ManualModePayload): Promise<VerificationSession> => {
    const { data } = await http.post<ApiEnvelope<VerificationSession>>('/identity/manual-mode', payload);
    return data.data;
  },

  approveManual: async (id: string): Promise<void> => {
    await http.post(`/identity/${id}/approve-manual`);
  },

  rejectManual: async (id: string, payload: RejectManualPayload): Promise<void> => {
    await http.post(`/identity/${id}/reject-manual`, payload);
  },

  getSession: async (id: string): Promise<VerificationSession> => {
    const { data } = await http.get<ApiEnvelope<VerificationSession>>(`/identity/${id}`);
    return data.data;
  },

  getManualSessions: async (params?: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected' }): Promise<VerificationSession[]> => {
    const { data } = await http.get<ApiEnvelope<VerificationSession[]>>('/identity/manual', { params });
    const result = data.data ?? data;
    return Array.isArray(result) ? result : [];
  },

  createQoreIdSession: async (id: string): Promise<{ sessionId: string; sdkSessionToken: string }> => {
    const { data } = await http.post<ApiEnvelope<{ sessionId: string; sdkSessionToken: string }>>(`/identity/${id}/qoreid-session`);
    return data.data;
  },
};
