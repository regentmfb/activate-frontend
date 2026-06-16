import apiClient from '@/src/lib/api-client';
import type { AccountRequest, InitiateAccountPayload, AccountEnquiryResponse, GetAllAccountsParams } from '../types/account-request.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

const http = apiClient;

export const accountOpeningApi = {
  initiate: async (payload: InitiateAccountPayload): Promise<AccountRequest> => {
    const { data } = await http.post<ApiEnvelope<AccountRequest>>('/activate/accounts', payload);
    return data.data;
  },

  getMyRequests: async (): Promise<AccountRequest[]> => {
    const { data } = await http.get<ApiEnvelope<AccountRequest[]>>('/activate/accounts/my');
    return data.data;
  },

  getById: async (id: string): Promise<AccountRequest> => {
    const { data } = await http.get<ApiEnvelope<AccountRequest>>(`/activate/accounts/${id}`);
    return data.data;
  },

  cancel: async (id: string): Promise<AccountRequest> => {
    const { data } = await http.post<ApiEnvelope<AccountRequest>>(`/activate/accounts/${id}/cancel`);
    return data.data;
  },

  retry: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await http.post<ApiEnvelope<{ success: boolean; message: string }>>(`/activate/accounts/${id}/retry`);
    return data.data;
  },

  enquiry: async (accountNumber: string): Promise<AccountEnquiryResponse> => {
    const { data } = await http.get<ApiEnvelope<AccountEnquiryResponse>>(`/activate/accounts/enquiry/${accountNumber}`);
    return data.data;
  },

  checkExistence: async (identifier: string, accountType: 'SAVINGS' | 'CURRENT'): Promise<{ exists: boolean; message: string }> => {
    const { data } = await http.get<ApiEnvelope<{ exists: boolean; message: string }>>('/activate/accounts/check-existence', {
      params: { identifier, accountType },
    });
    return data.data;
  },

  getByCustomerId: async (customerId: string): Promise<AccountRequest[]> => {
    const { data } = await http.get<ApiEnvelope<AccountRequest[]>>(`/activate/accounts/customer/${customerId}`);
    return data.data;
  },

  getAll: async (params?: GetAllAccountsParams): Promise<AccountRequest[]> => {
    const { data } = await http.get<ApiEnvelope<any>>('/activate/accounts/all', { params });
    // Handle paginated response: {success, data: {data: [...], meta: {}}}
    if (data.data && typeof data.data === 'object' && 'data' in data.data) {
      return Array.isArray(data.data.data) ? data.data.data : [];
    }
    return Array.isArray(data.data) ? data.data : [];
  },
};
