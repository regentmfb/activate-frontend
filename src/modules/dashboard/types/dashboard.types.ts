export type DashboardSummary = {
  // Core metrics — field names may vary; keep all variants
  accountsOpened?: number;
  accountCount?: number;
  pendingTasks?: number;
  mobileOnboarded?: number;
  mobileCount?: number;
  depositCount?: number;
  depositsCount?: number;
  deposits?: number;
  portfolioValue?: number | string;
  tierUpgradePending?: number;
  weeklyIncrement?: string;
  accountBreakdown?: AccountBreakdownItem[];
  productBreakdown?: { savings?: number; current?: number };

  // ── RM-specific fields (view: 'RELATIONSHIP_MANAGER') ──
  summary?: {
    accountsOpened?: number;
    deposits?: number;
    mobileOnboarded?: number;
    portfolioValue?: string | number;
    weeklyIncrement?: string;
  };
  targetsProgress?: {
    accounts?: { current: number; target: number; percent: number };
    deposits?: { current: number; target: number; percent: number };
    mobile?:   { current: number; target: number; percent: number };
  };
  pendingTasksList?: ApiTaskRaw[];
  totalPendingTasks?: number;
  view?: string;
};

// Raw task shape embedded in the dashboard response
export type ApiTaskRaw = {
  id: string;
  activateRequestId: string | null;
  customerId: string | null;
  customerName?: string;
  taskType: string;
  title?: string;
  description?: string;
  status: string;
  priority?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  dueAt?: string | null;
  assignedTo?: { staffId: string; staffName: string };
};

export type AccountBreakdownItem = {
  type: string;
  label: string;
  count: number;
};

export type DashboardPeriod = 'THIS_MONTH' | 'LAST_MONTH' | 'YEAR_TO_DATE';

// ── Team performance types ────────────────────────────────────────────────────

export type RmPerformance = {
  rmName: string;
  accounts: number;
  deposits: number;
  mobileOnboarded: number;
};

export type StaffPerformanceStat = {
  staffId?: string;
  staffName: string;
  rmName?: string; // Backend uses rmName instead of staffName in some responses
  role?: string;
  accounts?: number;
  accountsOpened?: number;
  deposits?: number;
  depositCount?: number;
  portfolioValue?: number | string;
  mobileOnboarded: number;
  accountBreakdown?: AccountBreakdownItem[];
};

export type TeamLeadDashboardResponse = {
  view: 'TEAM_LEAD';
  summary: {
    teamAccountCount: number;
    teamDepositsCount: number;
    teamMobileCount: number;
    teamPortfolioValue: string;
    weeklyIncrement: string;
  };
  productBreakdown: {
    savings: number;
    current: number;
  };
  rmPerformanceList: RmPerformance[];
};

export type TeamLeadSummary = {
  teamLeadId?: string;
  teamLeadName?: string;
  totalAccountsOpened: number;
  totalDepositCount: number;
  totalPortfolioValue: number | string;
  totalMobileOnboarded: number;
  teamAccountTarget?: number;
  teamMobileTarget?: number;
  teamDepositsTarget?: number;
  rms: StaffPerformanceStat[];
  rmPerformanceList?: RmPerformance[]; // Backend format
};

export type CmoSummary = {
  // Actual backend shape (view: 'CMO')
  view?: string;
  summary?: {
    directorateAccounts?: number;
    directorateDeposits?: number;
    directorateMobile?: number;
    directoratePortfolioValue?: string | number;
    weeklyIncrement?: string;
  };
  productBreakdown?: { savings?: number; current?: number };
  teamLeadPerformanceList?: {
    teamLeadName: string;
    accounts: number;
    deposits: number;
    mobileOnboarded: number;
  }[];
  rmPerformanceList?: {
    rmName: string;
    accounts: number;
    deposits: number;
    mobileOnboarded: number;
  }[];
  branchPerformanceList?: {
    branchId: string;
    branchName: string;
    accounts: number;
    deposits: number;
    mobileOnboarded: number;
  }[];

  // Normalised fields (populated by transformer)
  totalAccountsOpened?: number;
  totalDepositCount?: number;
  totalPortfolioValue?: number | string;
  totalMobileOnboarded?: number;
  cmoAccountTarget?: number;
  cmoMobileTarget?: number;
  cmoDepositsTarget?: number;
  teamLeads?: TeamLeadSummary[];
  cmoId?: string;
  cmoName?: string;
};

export type BankWideSummary = {
  totalAccountsOpened: number;
  totalDepositCount: number;
  totalPortfolioValue: number | string;
  totalMobileOnboarded: number;
  cmos: CmoSummary[];
  otherStaff: StaffPerformanceStat[];
};

// ── Branch performance types ──────────────────────────────────────────────────

export type BranchPerformance = {
  branchId: string;
  branchName: string;
  branchCode?: string;
  totalAccountsOpened: number;
  totalDepositCount: number;
  totalPortfolioValue: number | string;
  totalMobileOnboarded: number;
  teamLeads: TeamLeadSummary[];
  productBreakdown?: {
    savings: number;
    current: number;
  };
  weeklyIncrement?: string;
};

export type BranchDashboardResponse = {
  view: 'BRANCH';
  branches: BranchPerformance[];
  summary: {
    totalBranches: number;
    totalAccountsOpened: number;
    totalDepositCount: number;
    totalPortfolioValue: string | number;
    totalMobileOnboarded: number;
    weeklyIncrement?: string;
  };
  productBreakdown?: {
    savings: number;
    current: number;
  };
};
