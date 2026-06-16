'use client';

import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@src/store/auth.store';
import { RmDashboard } from '@src/modules/dashboard/components/RmDashboard';
import { TeamLeadDashboard } from '@src/modules/dashboard/components/TeamLeadDashboard';
import { CmoDashboard } from '@src/modules/dashboard/components/CmoDashboard';
import { MdDashboard } from '@src/modules/dashboard/components/MdDashboard';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  // Persisted from first successful /dashboard/my fetch — no extra API call needed
  const dashboardView = useAuthStore((s) => s.dashboardView);
  const searchParams = useSearchParams();
  const view = searchParams.get('view') as 'md' | 'cmo' | 'teamLead' | 'rm' | null;

  const getPrimaryRole = (): string => {
    // 1. Backend's own classification is the most accurate
    if (dashboardView) {
      if (dashboardView === 'CMO') return 'CMO';
      if (dashboardView === 'TEAM_LEAD') return 'TEAM_LEAD';
      if (dashboardView === 'RELATIONSHIP_MANAGER') return 'RM';
      if (dashboardView === 'MD' || dashboardView === 'EXECUTIVE') return 'MD';
    }

    // 2. Fallback to hrmsRoles string matching
    const roles = (user?.hrmsRoles ?? []).map(r => r.toUpperCase());
    if (roles.some(r => r === 'COMPANY' || r === 'SUPER_ADMIN')) return 'SUPER_ADMIN';
    if (roles.some(r => r === 'MD')) return 'MD';
    if (roles.some(r => r === 'CMO')) return 'CMO';
    if (roles.some(r => r === 'TEAM_LEAD' || r === 'TEAMLEAD')) return 'TEAM_LEAD';

    return 'RM';
  };

  const role = getPrimaryRole();

  // Super admin can switch perspectives via ?view= param
  if (role === 'SUPER_ADMIN') {
    if (view === 'rm') return <RmDashboard />;
    if (view === 'teamLead') return <TeamLeadDashboard />;
    if (view === 'cmo') return <CmoDashboard />;
    return <MdDashboard />;
  }

  // All other roles: ?view= param allows switching if provided
  if (view === 'rm') return <RmDashboard />;
  if (view === 'teamLead') return <TeamLeadDashboard />;
  if (view === 'cmo') return <CmoDashboard />;
  if (view === 'md') return <MdDashboard />;

  // Default: role-based dashboard
  if (role === 'TEAM_LEAD') return <TeamLeadDashboard />;
  if (role === 'CMO') return <CmoDashboard />;
  return <RmDashboard />;
}
