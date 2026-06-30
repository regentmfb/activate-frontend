'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowRight, TrendingUp, RotateCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCmoDashboard } from '../hooks/useDashboardSummary';
import { useActivateStaff } from '@src/modules/staff/hooks/useStaff';
import { type CmoDashboardParams } from '../api/dashboard.api';
import { useAuthStore } from '@src/store/auth.store';
import { PermissionGate } from '@src/components/ui/PermissionGate';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { PeriodSelector, PeriodFilter } from './PeriodSelector';
import {
  MetricCard,
  TopPerformersCard,
  StaffBarChart,
  TeamStatsCard,
  BranchPerformancePieChart,
  RmRadarChart,
} from './DashboardCharts';
import { BranchDashboard } from './BranchDashboard';

const SPARKLINE_ACCOUNTS  = [14, 18, 15, 22, 19, 24];
const SPARKLINE_PORTFOLIO = [9.2, 11.5, 13.8, 12.4, 14.1, 16.05];
const SPARKLINE_MOBILE    = [8, 11, 10, 14, 13, 18];
const SPARKLINE_DEPOSITS  = [6, 9, 8, 12, 11, 15];

export function CmoDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<CmoDashboardParams>({ period: 'month' });
  const { dashboard, isLoading, isFetching } = useCmoDashboard(filter);
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // 1. Force the next fetch to bypass backend cache and update/overwrite the server cache
      setFilter(prev => ({ ...prev, bypassCache: 'true' }));
      // 2. Invalidate react-query's local cache so it refetches
      await queryClient.invalidateQueries({ queryKey: ['dashboard', 'cmo'] });
      
      // 3. Clear the bypassCache param after a short delay so normal caching resumes
      setTimeout(() => {
        setFilter(prev => {
          const { bypassCache, ...rest } = prev;
          return rest;
        });
        setIsRefreshing(false);
      }, 1000);
    } catch (err) {
      setIsRefreshing(false);
    }
  };

  const { data: activeStaff, isLoading: staffLoading } = useActivateStaff();
  const activeTls = activeStaff?.teamLeads || [];
  const activeRms = activeStaff?.relationshipManagers || [];

  // ── Build filter option lists, all from activate-staff ──────────────────────

  // Unique branches across all active TLs + RMs
  const availableBranches = (() => {
    const seen = new Map<string, string>(); // branchId -> branchName
    [...activeTls, ...activeRms].forEach(s => {
      if (s.branchId && s.branch && s.branch !== 'N/A' && !seen.has(s.branchId)) {
        seen.set(s.branchId, s.branch);
      }
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  })();

  // Unique departments — narrowed by selected branch
  const availableDepartments = (() => {
    const seen = new Map<string, string>(); // departmentId -> departmentName
    [...activeTls, ...activeRms]
      .filter(s => !filter.branchId || s.branchId === filter.branchId)
      .forEach(s => {
        if (s.departmentId && s.department && s.department !== 'N/A' && !seen.has(s.departmentId)) {
          seen.set(s.departmentId, s.department);
        }
      });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  })();

  // Team Leads — narrowed by selected branch and/or department
  const availableTeamLeads = activeTls
    .filter(tl => {
      if (filter.branchId && tl.branchId !== filter.branchId) return false;
      if (filter.departmentId && tl.departmentId !== filter.departmentId) return false;
      return true;
    })
    .map(tl => ({ id: tl.staffId, name: tl.staffName }));

  // RMs — narrowed by selected branch, department, and/or team lead
  const availableRms = activeRms
    .filter(rm => {
      if (filter.branchId && rm.branchId !== filter.branchId) return false;
      if (filter.departmentId && rm.departmentId !== filter.departmentId) return false;
      if (filter.teamLeadId) {
        const selectedTl = activeTls.find(t => t.staffId === filter.teamLeadId);
        if (selectedTl && rm.departmentId !== selectedTl.departmentId) return false;
      }
      return true;
    })
    .map(rm => ({ id: rm.staffId, name: rm.staffName }));
  const { requirePin } = usePinVerification();
  const [portfolioRevealed, setPortfolioRevealed] = useState(false);
  const firstName = user?.firstName ?? 'there';

  function handleRevealPortfolio() {
    if (portfolioRevealed) { setPortfolioRevealed(false); return; }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealed(true));
  }

  // Show loading state at the component level or tab level
  const showOverviewLoading = isLoading || !dashboard;

  // Compute overview data safely if not loading and dashboard exists
  const totalAccounts = dashboard?.totalAccountsOpened ?? 0;
  const totalDeposits = dashboard?.totalDepositCount ?? 0;
  const totalMobile = dashboard?.totalMobileOnboarded ?? 0;
  const portfolioRaw = dashboard?.totalPortfolioValue;
  const weeklyIncrement = (dashboard as any)?.weeklyIncrement ?? '';

  const portfolioDisplay = portfolioRevealed && portfolioRaw
    ? (typeof portfolioRaw === 'number' ? formatCurrency(portfolioRaw) : String(portfolioRaw))
    : '₦ ••••••';

  const pb = dashboard?.productBreakdown;
  const savingsCount = pb?.savings ?? 0;
  const currentCount = pb?.current ?? 0;

  // Team Lead performance list for bar chart
  const tlList = dashboard?.teamLeadPerformanceList || [];
  const tlBarData = tlList.map((tl) => ({
    name: (tl.teamLeadName || 'Unknown').split(' ')[0],
    accounts: tl.accounts ?? 0,
    mobile: tl.mobileOnboarded ?? 0,
    deposits: tl.deposits ?? 0,
  }));

  // All RMs for TopPerformers
  const rmList = dashboard?.rmPerformanceList || [];
  const allRmsAsStaff = rmList.map((rm) => ({
    staffName: rm.rmName || 'Unknown',
    rmName:    rm.rmName,
    accountsOpened: rm.accounts ?? 0,
    accounts:       rm.accounts ?? 0,
    mobileOnboarded: rm.mobileOnboarded ?? 0,
    depositCount:    rm.deposits ?? 0,
    deposits:        rm.deposits ?? 0,
  }));

  // Bar chart data for RMs
  const rmBarData = rmList.map((rm) => ({
    name: (rm.rmName || 'Unknown').split(' ')[0],
    accounts: rm.accounts ?? 0,
    mobile: rm.mobileOnboarded ?? 0,
    deposits: rm.deposits ?? 0,
  }));

  // Team Lead list as staff for TeamStatsCard
  const tlAsStaff = tlList.map((tl) => ({
    staffName: tl.teamLeadName || 'Unknown',
    accountsOpened: tl.accounts ?? 0,
    accounts:       tl.accounts ?? 0,
    mobileOnboarded: tl.mobileOnboarded ?? 0,
    depositCount:    tl.deposits ?? 0,
    deposits:        tl.deposits ?? 0,
  }));

  return (
    <div className="space-y-5">
      {/* Refetch progress bar */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
          <div className="h-full animate-pulse" style={{ backgroundColor: '#920793', width: '100%' }} />
        </div>
      )}

      {showOverviewLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <svg className="animate-spin h-8 w-8 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
            </svg>
            <p className="text-[13px] text-gray-500">Loading dashboard…</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-black text-gray-900 flex items-center gap-2">
                Good day, {firstName} 👋
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Force refresh data"
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-[#920793]")} />
                </button>
              </h1>
              <p className="text-[13px] text-gray-400 mt-0.5">
                Your directorate performance overview.
                {weeklyIncrement && (
                  <span className="ml-2 inline-flex items-center gap-1 text-[#920793] font-semibold">
                    <TrendingUp className="h-3.5 w-3.5" /> {weeklyIncrement}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <PeriodSelector value={filter} onChange={(f) => setFilter(prev => ({ ...prev, ...f }))} />
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

          {/* Filters Row */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-4 items-end">
            {/* Period Selector for Mobile */}
            <div className="sm:hidden w-full">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Period</span>
              <PeriodSelector value={filter} onChange={(f) => setFilter(prev => ({ ...prev, ...f }))} />
            </div>

            {/* Branch Selector */}
            <div className="flex flex-col gap-1.5 min-w-[150px] flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Branch</span>
              <select
                value={filter.branchId || ''}
                disabled={staffLoading}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter(prev => ({
                    ...prev,
                    branchId: val || undefined,
                    departmentId: undefined,
                    teamLeadId: undefined,
                    rmId: undefined,
                  }));
                }}
                className="h-9 rounded-xl border border-gray-200 px-3 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#920793] transition-colors w-full disabled:opacity-60"
              >
                <option value="">All Branches</option>
                {availableBranches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Department Selector */}
            <div className="flex flex-col gap-1.5 min-w-[170px] flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Department</span>
              <select
                value={filter.departmentId || ''}
                disabled={staffLoading}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter(prev => ({
                    ...prev,
                    departmentId: val || undefined,
                    teamLeadId: undefined,
                    rmId: undefined,
                  }));
                }}
                className="h-9 rounded-xl border border-gray-200 px-3 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#920793] transition-colors w-full disabled:opacity-60"
              >
                <option value="">All Departments</option>
                {availableDepartments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Team Lead Selector */}
            <div className="flex flex-col gap-1.5 min-w-[180px] flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Team Lead</span>
              <select
                value={filter.teamLeadId || ''}
                disabled={staffLoading}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter(prev => ({
                    ...prev,
                    teamLeadId: val || undefined,
                    rmId: undefined,
                  }));
                }}
                className="h-9 rounded-xl border border-gray-200 px-3 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#920793] transition-colors w-full disabled:opacity-60"
              >
                <option value="">
                  {availableTeamLeads.length === 0 ? 'No Team Leads' : 'All Team Leads'}
                </option>
                {availableTeamLeads.map(tl => (
                  <option key={tl.id} value={tl.id}>{tl.name}</option>
                ))}
              </select>
            </div>

            {/* RM Selector */}
            <div className="flex flex-col gap-1.5 min-w-[180px] flex-1 sm:flex-initial">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Relationship Manager</span>
              <select
                value={filter.rmId || ''}
                disabled={staffLoading}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilter(prev => ({
                    ...prev,
                    rmId: val || undefined,
                  }));
                }}
                className="h-9 rounded-xl border border-gray-200 px-3 text-[13px] text-gray-700 bg-gray-50 outline-none focus:border-[#920793] transition-colors w-full disabled:opacity-60"
              >
                <option value="">
                  {availableRms.length === 0 ? 'No RMs' : 'All RMs'}
                </option>
                {availableRms.map(rm => (
                  <option key={rm.id} value={rm.id}>{rm.name}</option>
                ))}
              </select>
            </div>

            {/* Active filter chips */}
            {(filter.branchId || filter.departmentId || filter.teamLeadId || filter.rmId) && (
              <button
                onClick={() => setFilter(prev => ({
                  period: prev.period,
                  startDate: prev.startDate,
                  endDate: prev.endDate,
                } as CmoDashboardParams))}
                className="h-9 px-4 rounded-xl border border-red-100 text-[12px] font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Data rows */}
          <div className={cn('space-y-5 transition-opacity duration-300', isFetching && 'opacity-50 pointer-events-none')}>

            {/* ── Row 1: 4 metric cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Total Accounts"
                value={totalAccounts}
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
                value={totalMobile}
                sub="Active users"
                sparkData={SPARKLINE_MOBILE}
                sparkColor="#0284c7"
                accentColor="#0284c7"
              />
              <MetricCard
                label="Total Deposits (Portfolio)"
                value={formatCurrency(totalDeposits)}
                sub="Contributes to portfolio"
                sparkData={SPARKLINE_DEPOSITS}
                sparkColor="#16a34a"
                accentColor="#16a34a"
              />
            </div>

            {/* ── Row 2: Top performers + Team stats ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
              <div className="lg:col-span-3">
                {allRmsAsStaff.length > 0
                  ? <TopPerformersCard staff={allRmsAsStaff} />
                  : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-full min-h-[200px]">
                      <p className="text-[13px] text-gray-400">No RM data available for this period</p>
                    </div>
                  )
                }
              </div>
              <div className="lg:col-span-2">
                <TeamStatsCard
                  staff={tlAsStaff.length > 0 ? tlAsStaff : allRmsAsStaff}
                  title="Directorate Progress"
                  accountTarget={dashboard?.cmoAccountTarget ?? Math.max(Math.ceil(totalAccounts * 1.25), 10)}
                  mobileTarget={dashboard?.cmoMobileTarget ?? Math.max(Math.ceil(totalMobile * 1.25), 10)}
                  depositTarget={dashboard?.cmoDepositsTarget ?? Math.max(Math.ceil(totalDeposits * 1.25), 10)}
                />
              </div>
            </div>

            {/* ── Row 3: Team Lead comparison bar chart & Branch Performance Pie Chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
              <div className="lg:col-span-3 flex flex-col justify-between h-full">
                {tlBarData.length > 0 ? (
                  <StaffBarChart
                    data={tlBarData}
                    title="Team Lead Comparison"
                    subtitle="Accounts, mobile & deposits per team lead"
                    typeLabel="Team Leads"
                  />
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-full min-h-[260px]">
                    <p className="text-[13px] text-gray-400">No team lead data available</p>
                  </div>
                )}
              </div>
              <div className="lg:col-span-2 flex flex-col justify-between h-full">
                <BranchPerformancePieChart branches={dashboard?.branchPerformanceList || []} />
              </div>
            </div>

            {/* ── Row 4: RM Comparison Bar Chart & RM Performance Radar Chart ── */}
            {rmBarData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
                <div className="lg:col-span-3 flex flex-col justify-between h-full">
                  <StaffBarChart
                    data={rmBarData}
                    title="Relationship Manager Comparison"
                    subtitle="Accounts, mobile & deposits per relationship manager"
                  />
                </div>
                <div className="lg:col-span-2 flex flex-col justify-between h-full">
                  <RmRadarChart rms={allRmsAsStaff} teamLeads={tlAsStaff} />
                </div>
              </div>
            )}

            {/* <button
              onClick={() => router.push('/staff')}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-purple-100 text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              View Full Staff Details <ArrowRight className="h-4 w-4" />
            </button> */}

          </div>
        </>
      )}
    </div>
  );
}
