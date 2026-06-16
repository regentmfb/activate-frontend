import apiClient from '@/src/lib/api-client';

type RevealTokenResponse = {
  success: boolean;
  statusCode: number;
  data: { revealToken: string };
};

type CustomerBiodata = {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  bvn?: string;
  nin?: string;
};

type AccountBalance = {
  accountNumber: string;
  ledgerBalance: number;
  availableBalance: number;
};

type RevealResponse<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

const http = apiClient;

export const securityApi = {
  getRevealToken: async (pin: string): Promise<string> => {
    const { data } = await http.post<RevealTokenResponse>('/activate/security/reveal-token', { pin });
    return data.data.revealToken;
  },

  revealBiodata: async (customerId: string, revealToken: string): Promise<CustomerBiodata> => {
    const { data } = await http.get<RevealResponse<CustomerBiodata>>(
      `/activate/customers/${customerId}/reveal-biodata`,
      { headers: { 'x-reveal-token': revealToken } }
    );
    return data.data;
  },

  revealBalance: async (accountId: string, revealToken: string): Promise<AccountBalance> => {
    const { data } = await http.get<RevealResponse<AccountBalance>>(
      `/activate/accounts/${accountId}/reveal-balance`,
      { headers: { 'x-reveal-token': revealToken } }
    );
    return data.data;
  },
};

export type { CustomerBiodata, AccountBalance };
