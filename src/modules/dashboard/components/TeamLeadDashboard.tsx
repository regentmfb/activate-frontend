'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { useTeamLeadDashboard } from '../hooks/useDashboardSummary';
import { useTaskBank } from '@src/modules/tasks/hooks/useTaskBank';
import { useAuthStore } from '@src/store/auth.store';
import { Task } from '@src/modules/tasks/types/tasks.types';
import { PermissionGate } from '@src/components/ui/PermissionGate';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { PeriodSelector, PeriodFilter } from './PeriodSelector';
import {
  MetricCard,
  PendingTasksCard,
  TopPerformersCard,
  StaffBarChart,
  TeamStatsCard,
} from './DashboardCharts';

const SPARKLINE_ACCOUNTS = [14, 18, 15, 22, 19, 24];
const SPARKLINE_PORTFOLIO = [9.2, 11.5, 13.8, 12.4, 14.1, 16.05];
const SPARKLINE_MOBILE    = [8, 11, 10, 14, 13, 18];
const SPARKLINE_DEPOSITS  = [6, 9, 8, 12, 11, 15];

export function TeamLeadDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<PeriodFilter>({ period: 'month' });
  const { dashboard, isLoading, isFetching } = useTeamLeadDashboard(filter);
  const { tasks } = useTaskBank();
  const { requirePin } = usePinVerification();
  const [portfolioRevealed, setPortfolioRevealed] = useState(false);
  const firstName = user?.firstName ?? 'there';

  function handleRevealPortfolio() {
    if (portfolioRevealed) { setPortfolioRevealed(false); return; }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealed(true));
  }

  if (isLoading || !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
          </svg>
          <p className="text-[13px] text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const portfolioDisplay = portfolioRevealed && dashboard.totalPortfolioValue
    ? (typeof dashboard.totalPortfolioValue === 'number'
        ? formatCurrency(dashboard.totalPortfolioValue)
        : String(dashboard.totalPortfolioValue))
    : '₦ ••••••';

  const rms = Array.isArray(dashboard.rms) ? dashboard.rms : [];
  const weeklyIncrement = (dashboard as any).weeklyIncrement ?? '';

  const rmBarData = rms.map((r) => ({
    name: (r.staffName || r.rmName || 'Unknown').split(' ')[0],
    accounts: r.accountsOpened ?? r.accounts ?? 0,
    mobile: r.mobileOnboarded ?? 0,
    deposits: r.depositCount ?? r.deposits ?? 0,
  }));

  // Product breakdown
  const pb = (dashboard as any).productBreakdown as { savings?: number; current?: number } | undefined;
  const savingsCount = pb?.savings ?? 0;
  const currentCount = pb?.current ?? 0;

  const pendingTasksCount = tasks.filter(t =>
    t.status === 'PENDING_ACTION' || t.status === 'PENDING_REVIEW' ||
    t.status === 'PENDING_UPLOAD' || t.status === 'PENDING_VERIFICATION'
  ).length;

  return (
    <div className="space-y-5">
      {/* Refetch progress bar */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
          <div className="h-full animate-pulse" style={{ backgroundColor: '#920793', width: '100%' }} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Good day, {firstName} 👋</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Your team performance overview.
            {weeklyIncrement && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#920793] font-semibold">
                <TrendingUp className="h-3.5 w-3.5" /> {weeklyIncrement}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <PeriodSelector value={filter} onChange={setFilter} />
          </div>
          <PermissionGate permission="CAN_OPEN_ACCOUNT">
            <button
              onClick={() => router.push('/account-opening/select-type')}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-[13px] font-bold shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#920793' }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Open Account</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* Data rows — fade while refetching */}
      <div className={cn('space-y-5 transition-opacity duration-300', isFetching && 'opacity-50 pointer-events-none')}>

        {/* ── Row 1: 4 team metric cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Team Accounts"
            value={dashboard.totalAccountsOpened ?? 0}
            sub={`${savingsCount} savings · ${currentCount} current`}
            sparkData={SPARKLINE_ACCOUNTS}
            accentColor="#920793"
            onClick={() => router.push('/staff')}
          />
          <MetricCard
            label="Portfolio Value"
            value={portfolioDisplay}
            sub="Tap to reveal"
            sparkData={SPARKLINE_PORTFOLIO}
            accentColor="#920793"
            onClick={handleRevealPortfolio}
          />
          <MetricCard
            label="Mobile Onboarded"
            value={dashboard.totalMobileOnboarded ?? 0}
            sub="Active users"
            sparkData={SPARKLINE_MOBILE}
            sparkColor="#0284c7"
            accentColor="#0284c7"
          />
          <MetricCard
            label="Team Deposits (Portfolio)"
            value={formatCurrency(dashboard.totalDepositCount ?? 0)}
            sub="Contributes to portfolio"
            sparkData={SPARKLINE_DEPOSITS}
            sparkColor="#16a34a"
            accentColor="#16a34a"
          />
        </div>

        {/* ── Row 2: Pending Tasks + Top Performers ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
          <div className="lg:col-span-3">
            <PendingTasksCard
              tasks={tasks.slice(0, 5)}
              onViewAll={() => router.push('/tasks')}
              onContinue={(task: Task) => router.push(`/tasks/${task.id}`)}
            />
          </div>
          <div className="lg:col-span-2">
            <TopPerformersCard staff={rms} />
          </div>
        </div>

        {/* ── Row 3: RM bar chart + Team stats ── */}
        {rmBarData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StaffBarChart
              data={rmBarData}
              title="RM Performance Comparison"
              subtitle="Accounts, mobile & deposits per RM"
            />
            <TeamStatsCard
              staff={rms}
              title="Team Monthly Progress"
              accountTarget={dashboard?.teamAccountTarget ?? 60}
              mobileTarget={dashboard?.teamMobileTarget ?? 45}
              depositTarget={dashboard?.teamDepositsTarget ?? 35}
            />
          </div>
        )}

        <button
          onClick={() => router.push('/staff')}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-purple-100 text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors"
        >
          View Full RM Details on Staff Page <ArrowRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}
