import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { dashboardApi, type CmoDashboardParams } from '../api/dashboard.api';
import { usePinStore } from '@src/modules/pin/store/pin.store';
import { useAuthStore } from '@src/store/auth.store';

export const DASHBOARD_QUERY_KEYS = {
  myDashboard: (period?: string, startDate?: string, endDate?: string, revealToken?: string | null) => 
    ['dashboard', 'my', period, startDate, endDate, revealToken] as const,
  teamLeadDashboard: (period?: string, startDate?: string, endDate?: string, revealToken?: string | null) => 
    ['dashboard', 'team-lead', period, startDate, endDate, revealToken] as const,
  cmoDashboard: (period?: string, startDate?: string, endDate?: string, branchId?: string, departmentId?: string, teamLeadId?: string, rmId?: string, revealToken?: string | null) => 
    ['dashboard', 'cmo', period, startDate, endDate, branchId, departmentId, teamLeadId, rmId, revealToken] as const,
  branchDashboard: (period?: string, startDate?: string, endDate?: string, revealToken?: string | null) => 
    ['dashboard', 'branches', period, startDate, endDate, revealToken] as const,
};

type PeriodFilter = {
  period?: 'week' | 'month' | 'ytd';
  startDate?: string;
  endDate?: string;
};

export function useDashboardSummary(filter?: PeriodFilter) {
  const revealToken = usePinStore((state) => state.revealToken);
  const setDashboardView = useAuthStore((s) => s.setDashboardView);
  
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.myDashboard(filter?.period, filter?.startDate, filter?.endDate, revealToken),
    queryFn: async () => {
      const result = await dashboardApi.getMyDashboard(filter, revealToken || undefined);
      // Persist the backend's view classification so the dashboard page can route correctly
      const view = (result as any)?.view as string | undefined;
      if (view) setDashboardView(view);
      return result;
    },
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  return { summary: data, isLoading, isFetching, error };
}

export function useTeamLeadDashboard(filter?: PeriodFilter) {
  const revealToken = usePinStore((state) => state.revealToken);
  
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.teamLeadDashboard(filter?.period, filter?.startDate, filter?.endDate, revealToken),
    queryFn: () => dashboardApi.getTeamLeadDashboard(filter, revealToken || undefined),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  return { dashboard: data, isLoading, isFetching, error };
}

export function useCmoDashboard(filter?: CmoDashboardParams) {
  const revealToken = usePinStore((state) => state.revealToken);
  
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.cmoDashboard(
      filter?.period,
      filter?.startDate,
      filter?.endDate,
      filter?.branchId,
      filter?.departmentId,
      filter?.teamLeadId,
      filter?.rmId,
      revealToken
    ),
    queryFn: () => dashboardApi.getCmoDashboard(filter, revealToken || undefined),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  return { dashboard: data, isLoading, isFetching, error };
}

export function useBranchDashboard(filter?: PeriodFilter) {
  const revealToken = usePinStore((state) => state.revealToken);
  
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.branchDashboard(filter?.period, filter?.startDate, filter?.endDate, revealToken),
    queryFn: () => dashboardApi.getBranchDashboard(filter, revealToken || undefined),
    staleTime: 1000 * 60 * 2,
    placeholderData: keepPreviousData,
  });

  return { branchData: data, isLoading, isFetching, error };
}
