'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp } from 'lucide-react';
import { useBranchDashboard } from '../hooks/useDashboardSummary';
import { useAuthStore } from '@src/store/auth.store';
import { PermissionGate } from '@src/components/ui/PermissionGate';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { PeriodSelector, PeriodFilter } from './PeriodSelector';
import type { BranchPerformance } from '../types/dashboard.types';
import { MetricCard, AccountTypeBreakdown, TopPerformersCard, TeamComparisonChart } from './DashboardCharts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function BranchDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<PeriodFilter>({ period: 'month' });
  const { branchData, isLoading, isFetching } = useBranchDashboard(filter);
  const { requirePin } = usePinVerification();
  const [portfolioRevealed, setPortfolioRevealed] = useState(false);

  function handleRevealPortfolio() {
    if (portfolioRevealed) {
      setPortfolioRevealed(false);
      return;
    }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealed(true));
  }

  if (isLoading || !branchData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-8 w-8 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
          </svg>
          <p className="text-[13px] text-gray-500">Loading branch performance…</p>
        </div>
      </div>
    );
  }

  const { summary, branches } = branchData;
  const portfolioDisplay = portfolioRevealed && summary.totalPortfolioValue
    ? (typeof summary.totalPortfolioValue === 'number' 
        ? formatCurrency(summary.totalPortfolioValue) 
        : String(summary.totalPortfolioValue))
    : '₦ ••••••';

  // Flat map all team leads across all branches
  const teamLeadsList = branches.flatMap((b) =>
    b.teamLeads.map((tl) => ({
      name: (tl.teamLeadName || 'Unknown').replace('Team Lead ', '').replace('No Team Lead', 'No TL'),
      accounts: tl.totalAccountsOpened,
      mobile: tl.totalMobileOnboarded,
      deposits: tl.totalDepositCount,
    }))
  );

  // Flat map all RMs across all branches/team leads
  const rmsList = branches.flatMap((b) =>
    b.teamLeads.flatMap((tl) =>
      tl.rms.map((rm) => ({
        staffId: rm.staffId || (rm as any).rmId || 'NO_RM',
        staffName: rm.staffName || rm.rmName || 'Unknown',
        accountsOpened: rm.accountsOpened ?? rm.accounts ?? 0,
        accounts: rm.accountsOpened ?? rm.accounts ?? 0,
        mobileOnboarded: rm.mobileOnboarded ?? 0,
        depositCount: rm.depositCount ?? rm.deposits ?? 0,
        portfolioValue: rm.portfolioValue,
      }))
    )
  );

  return (
    <div className="space-y-6">
      {/* Refetch progress bar */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5">
          <div className="h-full animate-pulse" style={{ backgroundColor: '#920793', width: '100%' }} />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Branch Performance 🏢</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Monitor performance across {summary.totalBranches} {summary.totalBranches === 1 ? 'branch' : 'branches'}.
            {summary.weeklyIncrement && (
              <span className="ml-2 inline-flex items-center gap-1 text-[#920793] font-semibold">
                <TrendingUp className="h-3.5 w-3.5" /> {summary.weeklyIncrement}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="block">
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

      {/* Data rows */}
      <div className={cn('space-y-6 transition-opacity duration-300', isFetching && 'opacity-50 pointer-events-none')}>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Total Accounts"
            value={summary.totalAccountsOpened}
            accentColor="#920793"
            sparkColor="#920793"
            sub="Across all branches"
            sparkData={[1, 3, 2, 4, 3, summary.totalAccountsOpened || 5]}
          />
          <MetricCard
            label="Portfolio Value"
            value={portfolioDisplay}
            accentColor="#b94db9"
            sparkColor="#b94db9"
            sub={`Tap to ${portfolioRevealed ? 'hide' : 'reveal'}`}
            sparkData={[12, 14, 15, 14, 16, 15]}
            onClick={handleRevealPortfolio}
          />
          <MetricCard
            label="Mobile Onboarded"
            value={summary.totalMobileOnboarded}
            accentColor="#0284c7"
            sparkColor="#0284c7"
            sub="Active users"
            sparkData={[2, 4, 3, 5, 4, summary.totalMobileOnboarded || 6]}
          />
          <MetricCard
            label="Total Deposits (Portfolio)"
            value={formatCurrency(summary.totalDepositCount)}
            accentColor="#16a34a"
            sparkColor="#16a34a"
            sub="Contributes to portfolio"
            sparkData={[1, 2, 3, 2, 4, summary.totalDepositCount || 5]}
          />
        </div>

        {/* ── Visual Performance Overview Charts ── */}
        {branches.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BranchComparisonChart branches={branches} />
            </div>
            <div className="flex flex-col justify-between h-full">
              <AccountTypeBreakdown
                items={[
                  { type: 'SAVINGS', label: 'Savings Accounts', count: (summary as any).savings ?? 0 },
                  { type: 'CURRENT', label: 'Current Accounts', count: (summary as any).current ?? 0 }
                ]}
                total={((summary as any).savings ?? 0) + ((summary as any).current ?? 0)}
              />
            </div>
          </div>
        )}

        {/* ── Detailed Analytics Leaderboards and Charts ── */}
        {branches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <TopBranchesCard branches={branches} />
            <TeamComparisonChart data={teamLeadsList} />
            <TopPerformersCard staff={rmsList} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <p className="text-[13px] text-gray-400">No branch data available for this period</p>
          </div>
        )}

      </div>
    </div>
  );
}

function TopBranchesCard({ branches }: { branches: BranchPerformance[] }) {
  const sorted = [...branches]
    .sort((a, b) => b.totalAccountsOpened - a.totalAccountsOpened)
    .slice(0, 5);
  const max = sorted[0]?.totalAccountsOpened || 1;
  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full bg-white border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900">Top Branches</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Ranked by accounts opened</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#920793]">
          {branches.length} branches
        </span>
      </div>
      <div className="flex-1 divide-y divide-gray-50">
        {sorted.map((b, i) => {
          const pct = Math.round((b.totalAccountsOpened / max) * 100);
          return (
            <div key={b.branchId} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-base w-5 shrink-0 text-center leading-none">
                  {MEDALS[i] ?? <span className="text-[12px] font-bold text-gray-400">{i + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{b.branchName}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 flex-1 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #920793, #b94db9)' }} />
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[18px] font-black leading-none text-[#920793]">{b.totalAccountsOpened}</p>
                  <p className="text-[9px] text-gray-400">accounts</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type BranchComparisonChartProps = {
  branches: BranchPerformance[];
};

function BranchComparisonChart({ branches }: BranchComparisonChartProps) {
  const chartData = branches.map((b) => ({
    name: b.branchName.replace(' Branch', '').substring(0, 15),
    accounts: b.totalAccountsOpened,
    mobile: b.totalMobileOnboarded,
    deposits: b.totalDepositCount,
  }));

  function Tip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-[12px] min-w-[140px]">
        {label && <p className="font-bold text-gray-400 mb-2 text-[10px] uppercase tracking-widest">{label}</p>}
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-black text-gray-900">{p.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-5 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-[15px] font-bold text-gray-900">Branch Performance</h3>
          <p className="text-[12px] text-gray-400 mt-0.5">Comparison across branches</p>
        </div>
        <div className="flex items-center gap-3">
          {[
            { label: 'Accounts', color: '#920793' },
            { label: 'Mobile', color: '#0284c7' },
            { label: 'Deposits', color: '#16a34a' },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4} barCategoryGap="25%" margin={{ left: -10, right: 10, top: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={24} />
            <Tooltip content={<Tip />} cursor={{ fill: '#f9fafb', radius: 6 }} />
            <Bar dataKey="accounts" name="Accounts" fill="#920793" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="mobile" name="Mobile" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={16} />
            <Bar dataKey="deposits" name="Deposits" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
