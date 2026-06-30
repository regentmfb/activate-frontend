'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useAuthStore } from '@src/store/auth.store';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency } from '@src/utils';
import {
  MetricCard,
  PerformanceStatisticsCard,
  ActivityOverviewCard,
  TopPerformersCard,
  StaffBarChart,
  TeamStatsCard,
  TeamComparisonChart,
} from './DashboardCharts';
import type { StaffPerformanceStat } from '../types/dashboard.types';

const SPARKLINE_ACCOUNTS  = [14, 18, 15, 22, 19, 24];
const SPARKLINE_PORTFOLIO = [9.2, 11.5, 13.8, 12.4, 14.1, 16.05];
const SPARKLINE_MOBILE    = [8, 11, 10, 14, 13, 18];
const SPARKLINE_DEPOSITS  = [6, 9, 8, 12, 11, 15];

export function MdDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [period, setPeriod] = useState<'week' | 'month' | 'ytd'>('month');
  // MD/Super Admin calls /my which returns bank-wide stats for their role
  const { summary, isLoading } = useDashboardSummary({ period });
  const { requirePin } = usePinVerification();
  const [portfolioRevealed, setPortfolioRevealed] = useState(false);
  const firstName = user?.firstName ?? 'there';

  function handleRevealPortfolio() {
    if (portfolioRevealed) { setPortfolioRevealed(false); return; }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealed(true));
  }

  if (isLoading || !summary) {
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

  const portfolioDisplay = portfolioRevealed && summary.portfolioValue
    ? (typeof summary.portfolioValue === 'number'
        ? formatCurrency(summary.portfolioValue)
        : String(summary.portfolioValue))
    : '₦ ••••••';

  const accountsOpened = summary.accountsOpened ?? summary.accountCount ?? 0;
  const mobileOnboarded = summary.mobileOnboarded ?? summary.mobileCount ?? 0;
  const depositCount = summary.depositCount ?? summary.depositsCount ?? 0;

  // Build bar chart data from accountBreakdown if available
  const breakdownBarData = Array.isArray(summary.accountBreakdown)
    ? summary.accountBreakdown.map((item) => ({
        name: item.label,
        accounts: item.count,
        mobile: 0,
        deposits: 0,
      }))
    : [];

  // Build a simple staff list from productBreakdown for TopPerformers fallback
  const syntheticStaff: StaffPerformanceStat[] = [];
  if (summary.productBreakdown) {
    const pb = summary.productBreakdown as Record<string, number>;
    Object.entries(pb).forEach(([key, value]) => {
      syntheticStaff.push({
        staffName: key.charAt(0).toUpperCase() + key.slice(1),
        accountsOpened: value,
        mobileOnboarded: 0,
        depositCount: 0,
        accounts: value,
        deposits: 0,
      });
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-[20px] font-black text-gray-900">Good day, {firstName} 👋</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Bank-wide performance overview.</p>
      </div>

      {/* ── Row 1: 2×2 metric cards + Performance Statistics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            label="Total Accounts"
            value={accountsOpened}
            trend={22}
            sub="Bank-wide"
            sparkData={SPARKLINE_ACCOUNTS}
            accentColor="#920793"
            onClick={() => router.push('/customers')}
          />
          <MetricCard
            label="Portfolio Value"
            value={portfolioDisplay}
            trend={31}
            sub="vs last month"
            sparkData={SPARKLINE_PORTFOLIO}
            accentColor="#920793"
            onClick={handleRevealPortfolio}
          />
          <MetricCard
            label="Mobile Onboarded"
            value={mobileOnboarded}
            trend={16}
            sub="Active users"
            sparkData={SPARKLINE_MOBILE}
            sparkColor="#0284c7"
            accentColor="#0284c7"
          />
          <MetricCard
            label="Total Deposits"
            value={formatCurrency(depositCount)}
            trend={11}
            sub="With deposit"
            sparkData={SPARKLINE_DEPOSITS}
            sparkColor="#16a34a"
            accentColor="#16a34a"
          />
        </div>
        <PerformanceStatisticsCard />
      </div>

      {/* ── Row 2: Activity Overview + Top Performers ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3">
          <ActivityOverviewCard />
        </div>
        <div className="lg:col-span-2">
          {syntheticStaff.length > 0
            ? <TopPerformersCard staff={syntheticStaff} />
            : (
              <div className="rounded-2xl border border-gray-100 shadow-sm bg-white flex items-center justify-center h-full min-h-[200px]">
                <p className="text-[13px] text-gray-400">No staff breakdown available</p>
              </div>
            )
          }
        </div>
      </div>

      {/* ── Row 3: Account breakdown bar ── */}
      {breakdownBarData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <StaffBarChart
            data={breakdownBarData}
            title="Account Type Breakdown"
            subtitle="Distribution by account type"
          />
          <TeamStatsCard
            staff={syntheticStaff}
            title="Bank Monthly Progress"
            accountTarget={Math.ceil(accountsOpened * 1.25)}
            mobileTarget={Math.ceil(mobileOnboarded * 1.25)}
            depositTarget={Math.ceil(depositCount * 1.25)}
          />
        </div>
      )}

      {/* <button
        onClick={() => router.push('/staff')}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-purple-100 text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors"
      >
        View Full Staff Details <ArrowRight className="h-4 w-4" />
      </button> */}
    </div>
  );
}
