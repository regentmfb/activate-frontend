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
    const { data } = await http.get<ApiEnvelope<TeamMember[]>>('/staff/team-members');
    const result = data.data ?? data;
    return Array.isArray(result) ? result : [];
  },

  getActivateStaff: async (): Promise<{ teamLeads: any[]; relationshipManagers: any[] }> => {
    const { data } = await http.get<ApiEnvelope<{ teamLeads: any[]; relationshipManagers: any[] }>>('/staff/activate-staff');
    return data.data ?? data;
  },

  getActivityLogs: async (params?: GetActivityLogsParams): Promise<ActivityLog[]> => {
    const { data } = await http.get<ApiEnvelope<ActivityLog[]>>('/activate/activity-logs', { params });
    const result = data.data ?? data;
    return Array.isArray(result) ? result : [];
  },
};
