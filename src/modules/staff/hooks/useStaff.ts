'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../api/staff.api';
import type { StaffMember, TeamMember, GetActivityLogsParams } from '../types/staff.types';

export const STAFF_QUERY_KEYS = {
  hierarchy: ['staff', 'hierarchy'] as const,
  teamMembers: ['staff', 'team-members'] as const,
  activityLogs: (params?: GetActivityLogsParams) => ['staff', 'activity-logs', params] as const,
};

// ── Hierarchy ─────────────────────────────────────────────────────────────────

export function useStaffHierarchy() {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.hierarchy,
    queryFn: () => staffApi.getHierarchy(),
    staleTime: 1000 * 60 * 5,
  });
}

// ── Team members ──────────────────────────────────────────────────────────────

export function useTeamMembers() {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.teamMembers,
    queryFn: () => staffApi.getTeamMembers(),
    staleTime: 0,
  });
}

export function useActivateStaff() {
  return useQuery({
    queryKey: ['staff', 'activate-staff'] as const,
    queryFn: () => staffApi.getActivateStaff(),
    staleTime: 1000 * 60 * 5,
  });
}

// ── Staff list (used by StaffList component) ──────────────────────────────────

function teamMemberToStaffMember(m: TeamMember): StaffMember {
  return {
    staffId: m.staffId,
    staffName: m.staffName,
    role: m.role as StaffMember['role'],
    accountsOpened: 0,
    mobileOnboarded: 0,
    depositCount: 0,
    portfolioValue: 0,
    accountBreakdown: [],
  };
}

export function useStaff() {
  const [search, setSearch] = useState('');
  const { data: teamMembers = [], isLoading } = useTeamMembers();

  const staff: StaffMember[] = teamMembers.map(teamMemberToStaffMember);

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.staffName.toLowerCase().includes(q) ||
      (s.email ?? '').toLowerCase().includes(q) ||
      (s.role ?? '').toLowerCase().includes(q)
    );
  });

  return {
    staff: filtered,
    allStaff: staff,
    search,
    setSearch,
    isLoading,
  };
}

// ── Staff detail (fetched dynamically from team members query) ──────────

export function useStaffById(staffId: string) {
  const { data: teamMembers = [], isLoading } = useTeamMembers();
  const member = teamMembers.find((m) => m.staffId === staffId);
  const staff = member ? teamMemberToStaffMember(member) : undefined;
  return { staff, isLoading };
}

export function useActivityLogs(params?: GetActivityLogsParams) {
  return useQuery({
    queryKey: STAFF_QUERY_KEYS.activityLogs(params),
    queryFn: () => staffApi.getActivityLogs(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}
