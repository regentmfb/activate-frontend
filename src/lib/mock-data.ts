import { Customer } from '@src/modules/customers/types/customers.types';
import { Task } from '@src/modules/tasks/types/tasks.types';
import { DashboardSummary, StaffPerformanceStat, TeamLeadSummary, CmoSummary, BankWideSummary } from '@src/modules/dashboard/types/dashboard.types';
import { WorkflowReview } from '@src/modules/workflow/types/workflow.types';
import { StaffMember } from '@src/modules/staff/types/staff.types';

// ── Customers ────────────────────────────────────────────────────────────────

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    fullName: 'Adaeze Chisom Okonkwo',
    firstName: 'Adaeze',
    lastName: 'Okonkwo',
    middleName: 'Chisom',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '1234567890',
    tier: 2,
    mobileActive: true,
    mobileOnboarded: true,
    hasDeposit: true,
    depositValue: 150000,
    depositCount: 4,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: '2',
    fullName: 'Emeka Nwosu',
    firstName: 'Emeka',
    lastName: 'Nwosu',
    accountType: 'INDIVIDUAL_CURRENT',
    accountNumber: '0987654321',
    tier: 1,
    mobileActive: false,
    mobileOnboarded: false,
    hasDeposit: false,
    depositCount: 0,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: '3',
    fullName: 'Fatima Bello',
    firstName: 'Fatima',
    lastName: 'Bello',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '1122334455',
    tier: 3,
    mobileActive: true,
    mobileOnboarded: true,
    hasDeposit: true,
    depositValue: 320000,
    depositCount: 7,
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: '4',
    fullName: 'Chukwudi Eze',
    firstName: 'Chukwudi',
    lastName: 'Eze',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '5544332211',
    tier: 1,
    mobileActive: false,
    mobileOnboarded: false,
    hasDeposit: true,
    depositValue: 50000,
    depositCount: 1,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: '5',
    fullName: 'Ngozi Adeleke',
    firstName: 'Ngozi',
    lastName: 'Adeleke',
    accountType: 'INDIVIDUAL_CURRENT',
    accountNumber: '6677889900',
    tier: 2,
    mobileActive: true,
    mobileOnboarded: true,
    hasDeposit: false,
    depositCount: 0,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// ── Tasks ─────────────────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    requestId: 'ACT-2024-001',
    customerName: 'Adebayo Johnson',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '1234567890',
    status: 'PENDING_ACTION',
    taskType: 'TIER_2_PENDING',
    title: 'Tier 2 Upgrade Required',
    description: 'Customer needs to complete Tier 2 upgrade requirements',
    priority: 'HIGH',
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '2',
    requestId: 'ACT-2024-002',
    customerName: 'Chioma Okafor',
    accountType: 'INDIVIDUAL_CURRENT',
    accountNumber: '0987654321',
    status: 'PENDING_UPLOAD',
    taskType: 'PICTURE_UPLOAD_PENDING',
    title: 'Picture Upload Pending',
    description: 'Customer photo needs to be uploaded',
    priority: 'MEDIUM',
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '3',
    requestId: 'ACT-2024-003',
    customerName: 'Ibrahim Musa',
    accountType: 'INDIVIDUAL_SAVINGS',
    status: 'PENDING_REVIEW',
    taskType: 'MANUAL_REVIEW_REQUIRED',
    title: 'Manual Review Required',
    description: 'Account requires manual verification review',
    priority: 'HIGH',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: '4',
    requestId: 'ACT-2024-004',
    customerName: 'Fatima Abdullahi',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '1122334455',
    status: 'PENDING_ACTION',
    taskType: 'MOBILE_ONBOARDING_PENDING',
    title: 'Mobile Onboarding Pending',
    description: 'Customer needs to complete mobile app onboarding',
    priority: 'LOW',
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    requestId: 'ACT-2024-005',
    customerName: 'Emeka Nwankwo',
    accountType: 'INDIVIDUAL_CURRENT',
    accountNumber: '5544332211',
    status: 'FAILED_RETRYABLE',
    taskType: 'REFERENCE_CORRECTION',
    title: 'Reference Correction Required',
    description: 'Reference information needs to be corrected',
    priority: 'HIGH',
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '6',
    requestId: 'ACT-2024-006',
    customerName: 'Blessing Okonkwo',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '6677889900',
    status: 'PENDING_ACTION',
    taskType: 'TIER_3_PENDING',
    title: 'Tier 3 Upgrade Required',
    description: 'Customer needs to complete Tier 3 upgrade requirements',
    priority: 'MEDIUM',
    updatedAt: new Date(Date.now() - 21600000).toISOString(),
    createdAt: new Date(Date.now() - 432000000).toISOString(),
  },
  {
    id: '7',
    requestId: 'ACT-2024-007',
    customerName: 'Tunde Adesanya',
    accountType: 'INDIVIDUAL_CURRENT',
    status: 'CANCELLED',
    taskType: 'DOCUMENT_VERIFICATION',
    title: 'Document Verification Failed',
    description: 'Customer document verification failed',
    priority: 'HIGH',
    updatedAt: new Date(Date.now() - 10800000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
  {
    id: '8',
    requestId: 'ACT-2024-008',
    customerName: 'Amaka Eze',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '9988776655',
    status: 'COMPLETED',
    taskType: 'DEPOSIT_FOLLOWUP',
    title: 'Deposit Follow-up',
    description: 'Follow up with customer on initial deposit',
    priority: 'LOW',
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
    createdAt: new Date(Date.now() - 604800000).toISOString(),
  },
];

// ── Account Opening Requests ──────────────────────────────────────────────────

export type AccountOpeningRequest = {
  id: string;
  customerName: string;
  accountType: string;
  accountNumber?: string;
  status: string;
  tier: number;
  pendingAction: string;
  createdAt: string;
  updatedAt: string;
};

export const MOCK_REQUESTS: Record<string, AccountOpeningRequest> = {
  'ACT-2024-001': {
    id: 'ACT-2024-001',
    customerName: 'Adebayo Johnson',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '1234567890',
    status: 'PENDING',
    tier: 1,
    pendingAction: 'Tier 2 upgrade required. Provide secondary ID and ID card photo.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  'ACT-2024-002': {
    id: 'ACT-2024-002',
    customerName: 'Chioma Okafor',
    accountType: 'INDIVIDUAL_CURRENT',
    accountNumber: '0987654321',
    status: 'IN_PROGRESS',
    tier: 1,
    pendingAction: 'Customer photo has not been uploaded yet.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  'ACT-2024-003': {
    id: 'ACT-2024-003',
    customerName: 'Ibrahim Musa',
    accountType: 'INDIVIDUAL_SAVINGS',
    status: 'PENDING',
    tier: 1,
    pendingAction: 'Identity verification failed. Account is pending Operations review.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  'ACT-2024-004': {
    id: 'ACT-2024-004',
    customerName: 'Fatima Abdullahi',
    accountType: 'INDIVIDUAL_SAVINGS',
    accountNumber: '1122334455',
    status: 'PENDING',
    tier: 2,
    pendingAction: 'Tier 3 upgrade required. Address and location verification needed.',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  'ACT-2024-005': {
    id: 'ACT-2024-005',
    customerName: 'Emeka Nwankwo',
    accountType: 'INDIVIDUAL_CURRENT',
    accountNumber: '5544332211',
    status: 'REJECTED',
    tier: 1,
    pendingAction: 'Reference form upload failed or was rejected. Please re-upload.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
};

// ── Workflow Reviews ──────────────────────────────────────────────────────────

export const MOCK_WORKFLOW_REVIEWS: WorkflowReview[] = [
  {
    id: 'WF-001',
    requestId: 'ACT-2024-003',
    customerName: 'Ibrahim Musa',
    accountType: 'INDIVIDUAL_SAVINGS',
    reviewType: 'MANUAL_VERIFICATION',
    submittedBy: 'Adaeze Okonkwo',
    submittedByRole: 'RM',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'WF-002',
    requestId: 'ACT-2024-009',
    customerName: 'Kelechi Obi',
    accountNumber: '3344556677',
    accountType: 'INDIVIDUAL_CURRENT',
    reviewType: 'ACCOUNT_OPENING',
    submittedBy: 'Emeka Nwosu',
    submittedByRole: 'RM',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'WF-003',
    requestId: 'ACT-2024-010',
    customerName: 'Yetunde Adeyemi',
    accountNumber: '7788990011',
    accountType: 'INDIVIDUAL_SAVINGS',
    reviewType: 'TIER_UPGRADE',
    submittedBy: 'Fatima Bello',
    submittedByRole: 'RM',
    status: 'APPROVED',
    reviewerNote: 'All documents verified. Tier 3 upgrade approved.',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'WF-004',
    requestId: 'ACT-2024-011',
    customerName: 'Seun Afolabi',
    accountType: 'INDIVIDUAL_SAVINGS',
    reviewType: 'CORRECTION',
    submittedBy: 'Chukwudi Eze',
    submittedByRole: 'RM',
    status: 'REJECTED',
    reviewerNote: 'BVN does not match provided biodata. Please re-verify.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'WF-005',
    requestId: 'ACT-2024-012',
    customerName: 'Amara Okafor',
    accountNumber: '2233445566',
    accountType: 'INDIVIDUAL_CURRENT',
    reviewType: 'LIEN_REQUEST',
    submittedBy: 'Ngozi Adeleke',
    submittedByRole: 'RM',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export function getWorkflowReviewById(id: string): WorkflowReview | null {
  return MOCK_WORKFLOW_REVIEWS.find((r) => r.id === id) ?? null;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  accountsOpened: 24,
  pendingTasks: 6,
  mobileOnboarded: 18,
  depositCount: 15,
  portfolioValue: 4_850_000,
  tierUpgradePending: 4,
  accountBreakdown: [
    { type: 'INDIVIDUAL_SAVINGS', label: 'Individual Savings', count: 14 },
    { type: 'INDIVIDUAL_CURRENT', label: 'Individual Current', count: 7 },
    { type: 'TARGET_SAVINGS', label: 'Target Savings', count: 2 },
    { type: 'KIDDIES_SAVINGS', label: 'Kiddies', count: 1 },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getTaskById(id: string): Task | null {
  return MOCK_TASKS.find((t) => t.id === id) ?? null;
}

export function getCustomerById(id: string): Customer | null {
  return MOCK_CUSTOMERS.find((c) => c.id === id) ?? null;
}

export function getRequestById(requestId: string): AccountOpeningRequest | null {
  return MOCK_REQUESTS[requestId] ?? null;
}

// ── Team hierarchy mock data ──────────────────────────────────────────────────

const makeBreakdown = (savings: number, current: number) => [
  { type: 'INDIVIDUAL_SAVINGS', label: 'Individual Savings', count: savings },
  { type: 'INDIVIDUAL_CURRENT', label: 'Individual Current', count: current },
];

// RMs
const RM_ADAEZE: StaffPerformanceStat = { staffId: 'rm1', staffName: 'Adaeze Okonkwo',  role: 'RM', accountsOpened: 24, depositCount: 15, portfolioValue: 4_850_000, mobileOnboarded: 18, accountBreakdown: makeBreakdown(14, 10) };
const RM_EMEKA:  StaffPerformanceStat = { staffId: 'rm2', staffName: 'Emeka Nwosu',     role: 'RM', accountsOpened: 18, depositCount: 10, portfolioValue: 3_200_000, mobileOnboarded: 12, accountBreakdown: makeBreakdown(10, 8) };
const RM_FATIMA: StaffPerformanceStat = { staffId: 'rm3', staffName: 'Fatima Bello',    role: 'RM', accountsOpened: 31, depositCount: 22, portfolioValue: 6_100_000, mobileOnboarded: 25, accountBreakdown: makeBreakdown(20, 11) };
const RM_CHUKWUDI: StaffPerformanceStat = { staffId: 'rm4', staffName: 'Chukwudi Eze', role: 'RM', accountsOpened: 14, depositCount: 8,  portfolioValue: 2_400_000, mobileOnboarded: 9,  accountBreakdown: makeBreakdown(9, 5) };
const RM_NGOZI:  StaffPerformanceStat = { staffId: 'rm5', staffName: 'Ngozi Adeleke',  role: 'RM', accountsOpened: 20, depositCount: 13, portfolioValue: 3_750_000, mobileOnboarded: 15, accountBreakdown: makeBreakdown(12, 8) };
const RM_TUNDE:  StaffPerformanceStat = { staffId: 'rm6', staffName: 'Tunde Adesanya', role: 'RM', accountsOpened: 9,  depositCount: 5,  portfolioValue: 1_200_000, mobileOnboarded: 6,  accountBreakdown: makeBreakdown(6, 3) };

// Team Leads
export const MOCK_TEAM_LEAD_1: TeamLeadSummary = {
  teamLeadId: 'tl1',
  teamLeadName: 'Chukwudi Eze',
  totalAccountsOpened: (RM_ADAEZE.accountsOpened ?? 0) + (RM_EMEKA.accountsOpened ?? 0),
  totalDepositCount: (RM_ADAEZE.depositCount ?? 0) + (RM_EMEKA.depositCount ?? 0),
  totalPortfolioValue: Number(RM_ADAEZE.portfolioValue ?? 0) + Number(RM_EMEKA.portfolioValue ?? 0),
  totalMobileOnboarded: (RM_ADAEZE.mobileOnboarded ?? 0) + (RM_EMEKA.mobileOnboarded ?? 0),
  rms: [RM_ADAEZE, RM_EMEKA],
};

export const MOCK_TEAM_LEAD_2: TeamLeadSummary = {
  teamLeadId: 'tl2',
  teamLeadName: 'Blessing Okonkwo',
  totalAccountsOpened: (RM_FATIMA.accountsOpened ?? 0) + (RM_CHUKWUDI.accountsOpened ?? 0),
  totalDepositCount: (RM_FATIMA.depositCount ?? 0) + (RM_CHUKWUDI.depositCount ?? 0),
  totalPortfolioValue: Number(RM_FATIMA.portfolioValue ?? 0) + Number(RM_CHUKWUDI.portfolioValue ?? 0),
  totalMobileOnboarded: (RM_FATIMA.mobileOnboarded ?? 0) + (RM_CHUKWUDI.mobileOnboarded ?? 0),
  rms: [RM_FATIMA, RM_CHUKWUDI],
};

export const MOCK_TEAM_LEAD_3: TeamLeadSummary = {
  teamLeadId: 'tl3',
  teamLeadName: 'Kelechi Obi',
  totalAccountsOpened: (RM_NGOZI.accountsOpened ?? 0) + (RM_TUNDE.accountsOpened ?? 0),
  totalDepositCount: (RM_NGOZI.depositCount ?? 0) + (RM_TUNDE.depositCount ?? 0),
  totalPortfolioValue: Number(RM_NGOZI.portfolioValue ?? 0) + Number(RM_TUNDE.portfolioValue ?? 0),
  totalMobileOnboarded: (RM_NGOZI.mobileOnboarded ?? 0) + (RM_TUNDE.mobileOnboarded ?? 0),
  rms: [RM_NGOZI, RM_TUNDE],
};

// CMOs
export const MOCK_CMO_1: CmoSummary = {
  cmoId: 'cmo1',
  cmoName: 'Blessing Okonkwo',
  totalAccountsOpened: MOCK_TEAM_LEAD_1.totalAccountsOpened + MOCK_TEAM_LEAD_2.totalAccountsOpened,
  totalDepositCount: MOCK_TEAM_LEAD_1.totalDepositCount + MOCK_TEAM_LEAD_2.totalDepositCount,
  totalPortfolioValue: Number(MOCK_TEAM_LEAD_1.totalPortfolioValue ?? 0) + Number(MOCK_TEAM_LEAD_2.totalPortfolioValue ?? 0),
  totalMobileOnboarded: MOCK_TEAM_LEAD_1.totalMobileOnboarded + MOCK_TEAM_LEAD_2.totalMobileOnboarded,
  teamLeads: [MOCK_TEAM_LEAD_1, MOCK_TEAM_LEAD_2],
};

export const MOCK_CMO_2: CmoSummary = {
  cmoId: 'cmo2',
  cmoName: 'Yetunde Adeyemi',
  totalAccountsOpened: MOCK_TEAM_LEAD_3.totalAccountsOpened,
  totalDepositCount: MOCK_TEAM_LEAD_3.totalDepositCount,
  totalPortfolioValue: MOCK_TEAM_LEAD_3.totalPortfolioValue,
  totalMobileOnboarded: MOCK_TEAM_LEAD_3.totalMobileOnboarded,
  teamLeads: [MOCK_TEAM_LEAD_3],
};

// Bank-wide (MD / Super Admin)
export const MOCK_BANK_WIDE: BankWideSummary = {
  totalAccountsOpened: (MOCK_CMO_1.totalAccountsOpened ?? 0) + (MOCK_CMO_2.totalAccountsOpened ?? 0),
  totalDepositCount: (MOCK_CMO_1.totalDepositCount ?? 0) + (MOCK_CMO_2.totalDepositCount ?? 0),
  totalPortfolioValue: Number(MOCK_CMO_1.totalPortfolioValue ?? 0) + Number(MOCK_CMO_2.totalPortfolioValue ?? 0),
  totalMobileOnboarded: (MOCK_CMO_1.totalMobileOnboarded ?? 0) + (MOCK_CMO_2.totalMobileOnboarded ?? 0),
  cmos: [MOCK_CMO_1, MOCK_CMO_2],
  otherStaff: [
    { staffId: 'ops1', staffName: 'Ngozi Adeleke',  role: 'OPERATIONS',       accountsOpened: 0, depositCount: 0, portfolioValue: 0, mobileOnboarded: 0, accountBreakdown: [] },
    { staffId: 'ic1',  staffName: 'Tunde Adesanya', role: 'INTERNAL_CONTROL', accountsOpened: 0, depositCount: 0, portfolioValue: 0, mobileOnboarded: 0, accountBreakdown: [] },
  ],
};

// Team Lead view — own RM team
export const MOCK_MY_TEAM: TeamLeadSummary = MOCK_TEAM_LEAD_1;

// ── Staff members (enriched for staff pages) ────────────────────────────────

export const MOCK_STAFF_MEMBERS: StaffMember[] = [
  { ...RM_ADAEZE,   email: 'adaeze.okonkwo@regentmfb.com',  phone: '08012345678', teamLeadId: 'tl1', teamLeadName: 'Chukwudi Eze',     cmoId: 'cmo1', cmoName: 'Blessing Okonkwo', joinedAt: new Date(Date.now() - 180 * 86400000).toISOString() },
  { ...RM_EMEKA,    email: 'emeka.nwosu@regentmfb.com',     phone: '08023456789', teamLeadId: 'tl1', teamLeadName: 'Chukwudi Eze',     cmoId: 'cmo1', cmoName: 'Blessing Okonkwo', joinedAt: new Date(Date.now() - 150 * 86400000).toISOString() },
  { ...RM_FATIMA,   email: 'fatima.bello@regentmfb.com',    phone: '08034567890', teamLeadId: 'tl2', teamLeadName: 'Blessing Okonkwo', cmoId: 'cmo1', cmoName: 'Blessing Okonkwo', joinedAt: new Date(Date.now() - 200 * 86400000).toISOString() },
  { ...RM_CHUKWUDI, email: 'chukwudi.eze@regentmfb.com',    phone: '08045678901', teamLeadId: 'tl2', teamLeadName: 'Blessing Okonkwo', cmoId: 'cmo1', cmoName: 'Blessing Okonkwo', joinedAt: new Date(Date.now() - 90 * 86400000).toISOString() },
  { ...RM_NGOZI,    email: 'ngozi.adeleke@regentmfb.com',   phone: '08056789012', teamLeadId: 'tl3', teamLeadName: 'Kelechi Obi',      cmoId: 'cmo2', cmoName: 'Yetunde Adeyemi',  joinedAt: new Date(Date.now() - 120 * 86400000).toISOString() },
  { ...RM_TUNDE,    email: 'tunde.adesanya@regentmfb.com',  phone: '08067890123', teamLeadId: 'tl3', teamLeadName: 'Kelechi Obi',      cmoId: 'cmo2', cmoName: 'Yetunde Adeyemi',  joinedAt: new Date(Date.now() - 60 * 86400000).toISOString() },
  { staffId: 'tl1', staffName: 'Chukwudi Eze',     role: 'TEAM_LEAD', accountsOpened: MOCK_TEAM_LEAD_1.totalAccountsOpened, depositCount: MOCK_TEAM_LEAD_1.totalDepositCount, portfolioValue: MOCK_TEAM_LEAD_1.totalPortfolioValue, mobileOnboarded: MOCK_TEAM_LEAD_1.totalMobileOnboarded, accountBreakdown: [], email: 'chukwudi.eze@regentmfb.com',     phone: '08045678901', cmoId: 'cmo1', cmoName: 'Blessing Okonkwo', joinedAt: new Date(Date.now() - 300 * 86400000).toISOString() },
  { staffId: 'tl2', staffName: 'Blessing Okonkwo', role: 'TEAM_LEAD', accountsOpened: MOCK_TEAM_LEAD_2.totalAccountsOpened, depositCount: MOCK_TEAM_LEAD_2.totalDepositCount, portfolioValue: MOCK_TEAM_LEAD_2.totalPortfolioValue, mobileOnboarded: MOCK_TEAM_LEAD_2.totalMobileOnboarded, accountBreakdown: [], email: 'blessing.okonkwo@regentmfb.com', phone: '08078901234', cmoId: 'cmo1', cmoName: 'Blessing Okonkwo', joinedAt: new Date(Date.now() - 400 * 86400000).toISOString() },
  { staffId: 'tl3', staffName: 'Kelechi Obi',      role: 'TEAM_LEAD', accountsOpened: MOCK_TEAM_LEAD_3.totalAccountsOpened, depositCount: MOCK_TEAM_LEAD_3.totalDepositCount, portfolioValue: MOCK_TEAM_LEAD_3.totalPortfolioValue, mobileOnboarded: MOCK_TEAM_LEAD_3.totalMobileOnboarded, accountBreakdown: [], email: 'kelechi.obi@regentmfb.com',      phone: '08089012345', cmoId: 'cmo2', cmoName: 'Yetunde Adeyemi',  joinedAt: new Date(Date.now() - 350 * 86400000).toISOString() },
  { staffId: 'cmo1', staffName: 'Blessing Okonkwo', role: 'CMO', accountsOpened: MOCK_CMO_1.totalAccountsOpened ?? 0, depositCount: MOCK_CMO_1.totalDepositCount ?? 0, portfolioValue: MOCK_CMO_1.totalPortfolioValue ?? 0, mobileOnboarded: MOCK_CMO_1.totalMobileOnboarded ?? 0, accountBreakdown: [], email: 'blessing.okonkwo@regentmfb.com', phone: '08078901234', joinedAt: new Date(Date.now() - 500 * 86400000).toISOString() },
  { staffId: 'cmo2', staffName: 'Yetunde Adeyemi',  role: 'CMO', accountsOpened: MOCK_CMO_2.totalAccountsOpened ?? 0, depositCount: MOCK_CMO_2.totalDepositCount ?? 0, portfolioValue: MOCK_CMO_2.totalPortfolioValue ?? 0, mobileOnboarded: MOCK_CMO_2.totalMobileOnboarded ?? 0, accountBreakdown: [], email: 'yetunde.adeyemi@regentmfb.com',  phone: '08090123456', joinedAt: new Date(Date.now() - 600 * 86400000).toISOString() },
];

export function getStaffById(staffId: string): StaffMember | null {
  return MOCK_STAFF_MEMBERS.find((s) => s.staffId === staffId) ?? null;
}
