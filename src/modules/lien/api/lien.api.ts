import apiClient from '@/src/lib/api-client';
import type {
  PlaceLienPayload,
  PlaceLienResponse,
  ReleaseLienPayload,
  ReleaseLienResponse,
  ActiveLiensResponse,
  LienRequest,
  LienRequestsResponse,
  SubmitLienRequestPayload,
  ReviewLienRequestPayload,
} from '../types/lien.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  status: string;
  data: T;
};

const http = apiClient;

export const lienApi = {
  // ── Active Liens (Operations view) ───────────────────────────────────────────

  getActiveLiens: async (page: number = 1, limit: number = 10): Promise<ActiveLiensResponse> => {
    const { data } = await http.get<ApiEnvelope<ActiveLiensResponse>>(
      '/activate/lien/active',
      { params: { page, limit } }
    );
    return data.data;
  },

  release: async (payload: ReleaseLienPayload, revealToken: string): Promise<ReleaseLienResponse> => {
    const { data } = await http.post<ApiEnvelope<ReleaseLienResponse>>(
      `/activate/lien/${payload.accountNumber}/release`,
      {},
      { headers: { 'x-reveal-token': revealToken } }
    );
    return data.data;
  },

  // ── Lien Requests workflow ────────────────────────────────────────────────────

  /** RM submits a lien request */
  submitRequest: async (payload: SubmitLienRequestPayload): Promise<LienRequest> => {
    const { data } = await http.post<ApiEnvelope<LienRequest>>('/activate/liens/request', payload);
    return data.data;
  },

  /** Get lien requests visible to the current user (filtered by role on backend) */
  getRequests: async (
    page: number = 1,
    limit: number = 10,
    status?: string,
    customerId?: string,
    accountId?: string
  ): Promise<LienRequestsResponse> => {
    const { data } = await http.get<ApiEnvelope<any>>('/activate/liens/requests', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(customerId ? { customerId } : {}),
        ...(accountId ? { accountId } : {}),
      },
    });
    const rawData = data.data;
    return {
      requests: (rawData?.data ?? []).map((req: any) => ({
        id: req.id,
        accountNumber: req.account?.bankOneAccountNumber || req.accountNumber || 'N/A',
        amount: Number(req.amount),
        reason: req.reason,
        customerId: req.customerId,
        customerName: req.customer ? [req.customer.firstName, req.customer.middleName, req.customer.lastName].filter(Boolean).join(' ') : req.customerName,
        status: req.status,
        submittedBy: req.submittedByName || req.submittedBy || 'N/A',
        submittedByRole: req.submittedByRole || 'N/A',
        teamLeadComment: req.reviewHistory?.find((h: any) => h.reviewerRole === 'TEAM_LEAD')?.comments,
        cmoComment: req.reviewHistory?.find((h: any) => h.reviewerRole === 'CMO')?.comments,
        operationsComment: req.reviewHistory?.find((h: any) => h.reviewerRole === 'OPERATIONS')?.comments,
        rejectedBy: req.reviewHistory?.find((h: any) => h.action === 'REJECT')?.reviewerName,
        rejectionReason: req.reviewHistory?.find((h: any) => h.action === 'REJECT')?.comments || req.rejectionReason,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
        supportingDocuments: req.supportingDocuments,
        customerDetails: req.customer ? {
          bvnMasked: req.customer.bvnMasked,
          ninMasked: req.customer.ninMasked,
          email: req.customer.email,
          phoneNumber: req.customer.phoneNumber,
          address: req.customer.address,
          gender: req.customer.gender,
          dateOfBirth: req.customer.dateOfBirth,
        } : undefined,
        accountDetails: req.account ? {
          accountCategory: req.account.accountCategory,
          requestNumber: req.account.requestNumber,
        } : undefined,
        reviewHistory: req.reviewHistory || [],
      })),
      pagination: {
        total: rawData?.meta?.total ?? 0,
        page: rawData?.meta?.page ?? 1,
        limit: rawData?.meta?.limit ?? 10,
        totalPages: rawData?.meta?.totalPages ?? 1,
      }
    };
  },

  getRequestById: async (id: string): Promise<LienRequest> => {
    const { data } = await http.get<ApiEnvelope<LienRequest>>(`/activate/liens/requests/${id}`);
    return data.data;
  },

  /** Team Lead approves or rejects; CMO approves or rejects */
  reviewRequest: async (id: string, payload: ReviewLienRequestPayload): Promise<LienRequest> => {
    const { data } = await http.post<ApiEnvelope<LienRequest>>(
      `/activate/liens/requests/${id}/review`,
      payload
    );
    return data.data;
  },

  /** Operations actually places the lien after CMO approval */
  placeFromRequest: async (requestId: string, revealToken: string): Promise<PlaceLienResponse> => {
    const { data } = await http.post<ApiEnvelope<PlaceLienResponse>>(
      '/activate/liens/place-from-request',
      { requestId },
      { headers: { 'x-reveal-token': revealToken } }
    );
    return data.data;
  },

  // ── Legacy direct place (kept for compliance workflow usage) ─────────────────

  place: async (payload: PlaceLienPayload, revealToken: string): Promise<PlaceLienResponse> => {
    const { data } = await http.post<ApiEnvelope<PlaceLienResponse>>(
      '/activate/lien',
      payload,
      { headers: { 'x-reveal-token': revealToken } }
    );
    return data.data;
  },
};