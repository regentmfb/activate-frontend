import apiClient from '@/src/lib/api-client';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

export type PeriodType = 'YEARLY' | 'QUARTERLY' | 'MONTHLY';

export interface StaffTarget {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  year: number;
  periodType: PeriodType;
  periodValue: number;
  accounts: number;
  mobile: number;
  deposits: string | number;
  setById: string;
  setByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetTargetPayload {
  staffId: string;
  staffName: string;
  role: string;
  year: number;
  periodType: PeriodType;
  periodValue: number;
  accounts?: number;
  mobile?: number;
  deposits?: number;
}

const http = apiClient;

export const targetsApi = {
  /** Create or modify target for a staff member */
  setTarget: async (payload: SetTargetPayload): Promise<StaffTarget> => {
    const { data } = await http.post<ApiEnvelope<StaffTarget>>('/activate/targets', payload);
    return data.data ?? data;
  },

  /** Get all targets set for a specific staff member */
  getTargetsByStaff: async (staffId: string): Promise<StaffTarget[]> => {
    const { data } = await http.get<ApiEnvelope<StaffTarget[]>>(`/activate/targets/staff/${staffId}`);
    return data.data ?? data;
  },

  /** Get the current target for the logged-in staff member */
  getCurrentTarget: async (): Promise<{
    accounts: number;
    mobile: number;
    deposits: number;
    periodType: PeriodType | null;
    periodValue: number | null;
  }> => {
    const { data } = await http.get<ApiEnvelope<{
      accounts: number;
      mobile: number;
      deposits: number;
      periodType: PeriodType | null;
      periodValue: number | null;
    }>>('/activate/targets/current');
    return data.data ?? data;
  },
};
