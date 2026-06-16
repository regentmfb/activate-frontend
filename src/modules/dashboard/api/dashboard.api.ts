import apiClient from '@/src/lib/api-client';
import type { 
  DashboardSummary, 
  TeamLeadSummary, 
  TeamLeadDashboardResponse, 
  CmoSummary,
  BranchDashboardResponse 
} from '../types/dashboard.types';

type ApiEnvelope<T> = {
  success: boolean;
  statusCode: number;
  status: string;
  data: T;
};

export type DashboardParams = {
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
  period?: 'week' | 'month' | 'ytd';
};

export type CmoDashboardParams = DashboardParams & {
  branchId?: string;
  departmentId?: string;
  teamLeadId?: string;
  rmId?: string;
  bypassCache?: string;
};

const http = apiClient;

export const dashboardApi = {
  /**
   * Get personalized dashboard metrics (supports RM, Team Lead, and CMO)
   * Automatically adapts based on user role
   */
  getMyDashboard: async (params?: DashboardParams, revealToken?: string): Promise<DashboardSummary> => {
    const { data } = await http.get<ApiEnvelope<DashboardSummary>>('/activate/dashboard/my', {
      params,
      headers: revealToken ? { 'x-reveal-token': revealToken } : {},
    });
    console.log('[dashboardApi] getMyDashboard returning:', data.data);

    const raw = data.data as any;

    // Normalise RM response (view: 'RELATIONSHIP_MANAGER') into DashboardSummary
    if (raw?.view === 'RELATIONSHIP_MANAGER' && raw?.summary) {
      return {
        ...raw,
        accountsOpened:   raw.summary.accountsOpened  ?? 0,
        deposits:         raw.summary.deposits         ?? 0,
        depositCount:     raw.summary.deposits         ?? 0,
        mobileOnboarded:  raw.summary.mobileOnboarded  ?? 0,
        portfolioValue:   raw.summary.portfolioValue,
        weeklyIncrement:  raw.summary.weeklyIncrement,
        productBreakdown: raw.productBreakdown,
        targetsProgress:  raw.targetsProgress,
        pendingTasksList: Array.isArray(raw.pendingTasks) ? raw.pendingTasks : [],
        totalPendingTasks: raw.totalPendingTasks ?? 0,
        view: raw.view,
      } as DashboardSummary;
    }

    return data.data;
  },

  /**
   * Get Team Lead dashboard with aggregates and breakdown by RM
   */
  getTeamLeadDashboard: async (params?: DashboardParams, revealToken?: string): Promise<TeamLeadSummary> => {
    const { data } = await http.get<ApiEnvelope<TeamLeadDashboardResponse>>('/activate/dashboard/team-lead', {
      params,
      headers: revealToken ? { 'x-reveal-token': revealToken } : {},
    });
    console.log('[dashboardApi] getTeamLeadDashboard returning:', data.data);
    
    // Transform backend response to match our types
    const response = data.data;
    return {
      totalAccountsOpened: response.summary.teamAccountCount,
      totalDepositCount: response.summary.teamDepositsCount,
      totalPortfolioValue: response.summary.teamPortfolioValue,
      totalMobileOnboarded: response.summary.teamMobileCount,
      teamAccountTarget: (response.summary as any).teamAccountTarget,
      teamMobileTarget: (response.summary as any).teamMobileTarget,
      teamDepositsTarget: (response.summary as any).teamDepositsTarget,
      rms: response.rmPerformanceList.map(rm => ({
        staffName: rm.rmName,
        accountsOpened: rm.accounts,
        depositCount: rm.deposits,
        mobileOnboarded: rm.mobileOnboarded,
      })),
      rmPerformanceList: response.rmPerformanceList,
    };
  },

  getCmoDashboard: async (params?: CmoDashboardParams, revealToken?: string): Promise<CmoSummary> => {
    const { data } = await http.get<ApiEnvelope<CmoSummary>>('/activate/dashboard/cmo', {
      params,
      headers: revealToken ? { 'x-reveal-token': revealToken } : {},
    });
    console.log('[dashboardApi] getCmoDashboard returning:', data.data);

    const raw = data.data as any;

    if (raw?.view === 'CMO' && raw?.summary) {
      return {
        ...raw,
        totalAccountsOpened:  raw.summary.directorateAccounts  ?? 0,
        totalDepositCount:    raw.summary.directorateDeposits   ?? 0,
        totalMobileOnboarded: raw.summary.directorateMobile     ?? 0,
        totalPortfolioValue:  raw.summary.directoratePortfolioValue,
        weeklyIncrement:      raw.summary.weeklyIncrement,
        cmoAccountTarget:     raw.summary.cmoAccountTarget,
        cmoMobileTarget:      raw.summary.cmoMobileTarget,
        cmoDepositsTarget:    raw.summary.cmoDepositsTarget,
        teamLeadPerformanceList: Array.isArray(raw.teamLeadPerformanceList) ? raw.teamLeadPerformanceList : [],
        rmPerformanceList:       Array.isArray(raw.rmPerformanceList) ? raw.rmPerformanceList : [],
        branchPerformanceList:   Array.isArray(raw.branchPerformanceList) ? raw.branchPerformanceList : [],
        productBreakdown:        raw.productBreakdown,
      } as CmoSummary;
    }

    return data.data;
  },

  /**
   * Get Branch dashboard for CMO - shows performance breakdown by branch
   * Each branch includes Team Leads and their RMs
   */
  getBranchDashboard: async (params?: DashboardParams, revealToken?: string): Promise<BranchDashboardResponse> => {
    const { data } = await http.get<ApiEnvelope<any>>('/activate/dashboard/branches', {
      params,
      headers: revealToken ? { 'x-reveal-token': revealToken } : {},
    });
    console.log('[dashboardApi] getBranchDashboard returning:', data.data);

    const raw = data.data;
    let rawBranches: any[] = [];
    let productBreakdown = { savings: 0, current: 0 };

    if (Array.isArray(raw)) {
      rawBranches = raw;
    } else if (raw && Array.isArray(raw.branches)) {
      rawBranches = raw.branches;
      productBreakdown = raw.productBreakdown || { savings: 0, current: 0 };
    } else {
      return raw;
    }

    const branches = rawBranches.map((b: any) => {
      const teamLeads = (b.teamLeads || []).map((tl: any) => {
        const rms = (tl.relationshipManagers || []).map((rm: any) => {
          return {
            staffId: rm.rmId,
            staffName: rm.rmName,
            accountsOpened: rm.completed ?? 0,
            accounts: rm.completed ?? 0,
            mobileOnboarded: rm.mobileCompletions ?? 0,
            depositCount: rm.completed ?? 0,
            portfolioValue: rm.depositValue,
          };
        });

        return {
          teamLeadId: tl.teamLeadId,
          teamLeadName: tl.teamLeadName,
          totalAccountsOpened: tl.completed ?? 0,
          totalDepositCount: tl.completed ?? 0,
          totalPortfolioValue: tl.depositValue,
          totalMobileOnboarded: tl.mobileCompletions ?? 0,
          rms,
        };
      });

      return {
        branchId: b.branchId,
        branchName: b.branchName,
        totalAccountsOpened: b.completed ?? 0,
        totalDepositCount: b.completed ?? 0,
        totalPortfolioValue: b.depositValue,
        totalMobileOnboarded: b.mobileCompletions ?? 0,
        teamLeads,
      };
    });

    let totalAccountsOpened = 0;
    let totalMobileOnboarded = 0;
    let totalDepositCount = 0;
    let totalPortfolioValue = 0;

    branches.forEach((b) => {
      totalAccountsOpened += b.totalAccountsOpened;
      totalMobileOnboarded += b.totalMobileOnboarded;
      totalDepositCount += b.totalDepositCount;
      
      const val = typeof b.totalPortfolioValue === 'number' 
        ? b.totalPortfolioValue 
        : parseFloat(String(b.totalPortfolioValue).replace(/[^0-9.]/g, '')) || 0;
      totalPortfolioValue += val;
    });

    return {
      view: 'BRANCH',
      branches,
      summary: {
        totalBranches: branches.length,
        totalAccountsOpened,
        totalDepositCount,
        totalPortfolioValue: revealToken ? totalPortfolioValue : '₦••••••',
        totalMobileOnboarded,
        savings: productBreakdown.savings,
        current: productBreakdown.current,
      },
      productBreakdown,
    } as unknown as BranchDashboardResponse;
  },
};
