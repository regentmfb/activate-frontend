'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Users, Building2, Award } from 'lucide-react';
import { RmDashboard } from './RmDashboard';
import { TeamLeadDashboard } from './TeamLeadDashboard';
import { CmoDashboard } from './CmoDashboard';
import { MdDashboard } from './MdDashboard';
import { cn } from '@src/utils';

type DashboardView = 'md' | 'cmo' | 'teamLead' | 'rm';

const TABS: Array<{ key: DashboardView; label: string; icon: React.ElementType; description: string }> = [
  // { key: 'md',       label: 'Executive', icon: Award,          description: 'Bank-wide overview' },
  { key: 'cmo',      label: 'CMO',       icon: Building2,      description: 'Directorate view' },
  { key: 'teamLead', label: 'Team Lead', icon: Users,          description: 'Team performance' },
  { key: 'rm',       label: 'RM',        icon: LayoutDashboard, description: 'Individual metrics' },
];

export function SuperAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = (searchParams.get('view') as DashboardView) ?? 'cmo';

  function switchView(key: DashboardView) {
    router.push(`/dashboard?view=${key}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-black text-gray-900">Super Admin Dashboard</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">
          View all dashboard perspectives across the organization
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => switchView(tab.key)}
                className={cn(
                  'flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all',
                  isActive
                    ? 'bg-[#920793] text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-white' : 'text-gray-400')} />
                <div className="text-center">
                  <p className={cn('text-[13px] font-bold', isActive ? 'text-white' : 'text-gray-700')}>
                    {tab.label}
                  </p>
                  <p className={cn('text-[11px]', isActive ? 'text-purple-100' : 'text-gray-400')}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Views */}
      <div className="pt-2">
        {activeView === 'md'       && <MdDashboard />}
        {activeView === 'cmo'      && <CmoDashboard />}
        {activeView === 'teamLead' && <TeamLeadDashboard />}
        {activeView === 'rm'       && <RmDashboard />}
      </div>
    </div>
  );
}
