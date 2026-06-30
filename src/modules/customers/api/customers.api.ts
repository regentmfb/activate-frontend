import apiClient from '@/src/lib/api-client';
import type {
  Customer,
  CustomerListResponse,
  CustomerDetailResponse,
  CustomerInflowsResponse,
  BankOneDetails,
} from '../types/customers.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

const http = apiClient;

export const customersApi = {
  getCustomers: async (revealToken?: string): Promise<CustomerListResponse> => {
    const { data } = await http.get<ApiEnvelope<CustomerListResponse>>('/activate/customers', {
      headers: revealToken ? { 'x-reveal-token': revealToken } : {},
    });
    console.log('[customersApi] getCustomers returning:', data);
    return data.data;
  },

  getCustomerById: async (id: string, revealToken?: string, accountId?: string): Promise<CustomerDetailResponse> => {
    const url = accountId ? `/activate/customers/${id}?accountId=${accountId}` : `/activate/customers/${id}`;
    const { data } = await http.get<ApiEnvelope<CustomerDetailResponse>>(url, {
      headers: revealToken ? { 'x-reveal-token': revealToken } : {},
    });
    console.log('[customersApi] getCustomerById returning:', data);
    return data.data;
  },

  getCustomerInflows: async (
    id: string,
    page: number = 1,
    limit: number = 20,
    revealToken?: string
  ): Promise<CustomerInflowsResponse> => {
    const { data } = await http.get<ApiEnvelope<CustomerInflowsResponse>>(
      `/activate/customers/${id}/inflows`,
      {
        params: { page, limit },
        headers: revealToken ? { 'x-reveal-token': revealToken } : {},
      }
    );
    console.log('[customersApi] getCustomerInflows returning:', data);
    return data.data;
  },

  getCustomerBankOneDetails: async (id: string): Promise<BankOneDetails> => {
    const { data } = await http.get<ApiEnvelope<BankOneDetails>>(`/activate/customers/${id}/bankone`);
    console.log('[customersApi] getCustomerBankOneDetails returning:', data);
    return data.data;
  },
};
