import { StaffPerformanceStat } from '@src/modules/dashboard/types/dashboard.types';

// ── API response shapes ───────────────────────────────────────────────────────

export type StaffHierarchyMember = {
  staffId: string;
  staffName: string;
  role?: string;
};

export type StaffHierarchy = {
  staff: StaffHierarchyMember;
  managedMembers: StaffHierarchyMember[];
};

export type TeamMember = {
  staffId: string;
  staffName: string;
  role: string;
};

// ── Internal UI shape (kept for component compatibility) ──────────────────────

export type StaffMember = StaffPerformanceStat & {
  email?: string;
  phone?: string;
  teamLeadId?: string;
  teamLeadName?: string;
  cmoId?: string;
  cmoName?: string;
  joinedAt?: string;
};

export type ActivityLog = {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  module: string;
  details?: {
    requestId?: string;
    [key: string]: any;
  };
  createdAt: string;
};

export type GetActivityLogsParams = {
  page?: number;
  limit?: number;
  staffId?: string;
  action?: string;
  module?: string;
};

