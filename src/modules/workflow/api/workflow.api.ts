import apiClient from '@/src/lib/api-client';
import type {
  WorkflowReview,
  ComplianceAccountRequest,
  ComplianceAccountDetail,
  ReviewApprovalPayload,
  NonCompliantPayload,
  ComplianceLienPayload,
  ReviewApprovalResponse,
  NonCompliantResponse,
  ComplianceLienResponse,
  UpdateComplianceAccountPayload,
} from '../types/workflow.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  status: string;
  data: T;
};

const http = apiClient;

export const workflowApi = {
  // ── Existing workflow endpoints ─────────────────────────────────────────────
  
  getReviews: async (): Promise<WorkflowReview[]> => {
    const { data } = await http.get<ApiEnvelope<WorkflowReview[]>>('/workflow/reviews');
    return data.data;
  },

  getReviewById: async (id: string): Promise<WorkflowReview> => {
    const { data } = await http.get<ApiEnvelope<WorkflowReview>>(`/workflow/reviews/${id}`);
    return data.data;
  },

  approveReview: async (id: string, comments?: string): Promise<WorkflowReview> => {
    const { data } = await http.post<ApiEnvelope<WorkflowReview>>(
      `/workflow/reviews/${id}/approve`,
      { comments }
    );
    return data.data;
  },

  rejectReview: async (id: string, reason: string): Promise<WorkflowReview> => {
    const { data } = await http.post<ApiEnvelope<WorkflowReview>>(
      `/workflow/reviews/${id}/reject`,
      { reason }
    );
    return data.data;
  },

  // ── Compliance review endpoints ─────────────────────────────────────────────

  getComplianceAccounts: async (status?: 'pending' | 'reviewed' | 'rejected'): Promise<ComplianceAccountRequest[]> => {
    const params = status ? `?status=${status}` : '';
    const { data } = await http.get<ApiEnvelope<{ data: ComplianceAccountRequest[]; meta: any }>>(`/compliance/activate/accounts${params}`);
    return data.data.data;
  },

  getComplianceAccountById: async (id: string): Promise<ComplianceAccountDetail> => {
    const { data } = await http.get<ApiEnvelope<ComplianceAccountDetail>>(`/compliance/activate/accounts/${id}`);
    return data.data;
  },

  reviewApproval: async (id: string, payload: ReviewApprovalPayload): Promise<ReviewApprovalResponse> => {
    const { data } = await http.post<ApiEnvelope<ReviewApprovalResponse>>(
      `/compliance/activate/accounts/${id}/reviewed`,
      payload
    );
    return data.data;
  },

  markNonCompliant: async (id: string, payload: NonCompliantPayload): Promise<NonCompliantResponse> => {
    const { data } = await http.post<ApiEnvelope<NonCompliantResponse>>(
      `/compliance/activate/accounts/${id}/non-compliant`,
      payload
    );
    return data.data;
  },

  placeComplianceLien: async (id: string, payload: ComplianceLienPayload, revealToken: string): Promise<ComplianceLienResponse> => {
    const { data } = await http.post<ApiEnvelope<ComplianceLienResponse>>(
      `/compliance/activate/accounts/${id}/place-lien`,
      payload,
      { headers: { 'x-reveal-token': revealToken } }
    );
    return data.data;
  },

  updateComplianceAccount: async (id: string, payload: UpdateComplianceAccountPayload): Promise<ComplianceAccountRequest> => {
    const { data } = await http.patch<ApiEnvelope<ComplianceAccountRequest>>(
      `/compliance/activate/accounts/${id}`,
      payload
    );
    return data.data;
  },
};