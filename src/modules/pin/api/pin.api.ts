import apiClient from '@/src/lib/api-client';

type PinStatusResponse = {
  success: boolean;
  data: { hasPin: boolean };
};

type PinActionResponse = {
  success: boolean;
  data: { success: boolean };
};

const http = apiClient;

export const pinApi = {
  /** Check whether the authenticated staff has set a PIN */
  getStatus: async (): Promise<{ hasPin: boolean }> => {
    const { data } = await http.get<PinStatusResponse>('/activate/security/pin/status');
    return data.data;
  },

  /** First-time PIN setup — pin and confirmPin must match */
  setup: async (pin: string, confirmPin: string): Promise<void> => {
    await http.post<PinActionResponse>('/activate/security/pin/setup', { pin, confirmPin });
  },

  /** Change PIN — requires current PIN for verification */
  change: async (currentPin: string, newPin: string, confirmPin: string): Promise<void> => {
    await http.post<PinActionResponse>('/activate/security/pin/change', {
      currentPin,
      newPin,
      confirmPin,
    });
  },
};
