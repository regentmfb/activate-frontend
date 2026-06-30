import apiClient from '@/src/lib/api-client';
import type { StaffHierarchy, TeamMember, ActivityLog, GetActivityLogsParams } from '../types/staff.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  data: T;
};

const http = apiClient;

export const staffApi = {
  getHierarchy: async (): Promise<StaffHierarchy> => {
    const { data } = await http.get<ApiEnvelope<StaffHierarchy>>('/staff/hierarchy/me');
    return data.data ?? data;
  },

  getTeamMembers: async (): Promise<TeamMember[]> => {
    console.log('--- getTeamMembers CALLED ---');
    try {
      const { data } = await http.get<ApiEnvelope<any>>('/staff/team-members');
      console.log('TEAM MEMBERS RAW PAYLOAD:', data);
      const result = data.data ?? data;
      if (Array.isArray(result)) {
        console.log('--- RETURNING result ---', result);
        return result;
      }
      if (result && Array.isArray(result.data)) {
        console.log('--- RETURNING result.data ---', result.data);
        return result.data;
      }
      console.log('--- RETURNING [] ---');
      return [];
    } catch (error) {
      console.error('TEAM MEMBERS API ERROR:', error);
      return [];
    }
  },

  getActivateStaff: async (): Promise<{ teamLeads: any[]; relationshipManagers: any[] }> => {
    const { data } = await http.get<ApiEnvelope<{ teamLeads: any[]; relationshipManagers: any[] }>>('/staff/activate-staff');
    return data.data ?? data;
  },

  getActivityLogs: async (params?: GetActivityLogsParams): Promise<ActivityLog[]> => {
    const { data } = await http.get<ApiEnvelope<any>>('/activate/activity-logs', { params });
    const result = data.data ?? data;
    if (Array.isArray(result)) return result;
    if (result && Array.isArray(result.data)) return result.data;
    return [];
  },
};
