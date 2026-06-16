'use client';

import { useState } from 'react';
import { Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { StaffPerformanceStat } from '../types/dashboard.types';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';

const ROLE_LABELS: Record<string, string> = {
  RM: 'RM',
  TEAM_LEAD: 'Team Lead',
  CMO: 'CMO',
  OPERATIONS: 'Operations',
  INTERNAL_CONTROL: 'Int. Control',
};

const ROLE_COLORS: Record<string, string> = {
  RM: 'bg-purple-50 text-[#920793]',
  TEAM_LEAD: 'bg-blue-50 text-blue-600',
  CMO: 'bg-amber-50 text-amber-600',
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_SAVINGS: 'Savings',
  INDIVIDUAL_CURRENT: 'Current',
};

type Props = {
  title: string;
  staff: StaffPerformanceStat[];
  showRole?: boolean;
};

function StaffCard({ s, portfolioRevealed, showRole, max }: {
  s: StaffPerformanceStat;
  portfolioRevealed: boolean;
  showRole: boolean;
  max: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const initials = s.staffName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const accountsOpenedVal = s.accountsOpened ?? 0;
  const pct = max > 0 ? Math.round((accountsOpenedVal / max) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
            style={{ backgroundColor: '#920793' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-gray-900 truncate">{s.staffName}</p>
            {showRole && (
              <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', ROLE_COLORS[s.role ?? ''] ?? 'bg-gray-100 text-gray-500')}>
                {ROLE_LABELS[s.role ?? ''] ?? s.role}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[22px] font-black text-gray-900 leading-none">{s.accountsOpened ?? 0}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">accounts</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #920793, #b94db9)' }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">{pct}% of top performer</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {(() => {
            const portfolioVal = typeof s.portfolioValue === 'number' ? s.portfolioValue : parseFloat((s.portfolioValue as any) || '0');
            const safePortfolio = isNaN(portfolioVal) ? 0 : portfolioVal;
            return [
              { label: 'Mobile', value: s.mobileOnboarded, color: '#0284c7', bg: '#eff6ff' },
              { label: 'Deposits', value: s.depositCount ?? 0, color: '#16a34a', bg: '#f0fdf4' },
              { label: 'Portfolio', value: portfolioRevealed ? formatCurrency(safePortfolio) : '••••', color: '#920793', bg: '#fdf4ff' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl px-2 py-2 text-center" style={{ backgroundColor: stat.bg }}>
                <p className="text-[12px] font-black leading-none" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-[9px] text-gray-400 mt-0.5 font-medium">{stat.label}</p>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Account breakdown toggle */}
      {(s.accountBreakdown ?? []).length > 0 && (
        <>
          <button onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 border-t border-gray-50 text-[11px] font-semibold text-gray-400 hover:bg-gray-50 transition-colors">
            Account breakdown
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {expanded && (
            <div className="px-4 pb-3 flex gap-2">
              {(s.accountBreakdown ?? []).map((b) => (
                <div key={b.type} className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
                  <p className="text-[16px] font-black text-gray-900">{b.count}</p>
                  <p className="text-[10px] text-gray-500">{ACCOUNT_TYPE_LABELS[b.type] ?? b.label}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function StaffPerformanceTable({ title, staff, showRole = false }: Props) {
  const { requirePin } = usePinVerification();
  const [portfolioRevealed, setPortfolioRevealed] = useState(false);

  function handleReveal() {
    if (portfolioRevealed) { setPortfolioRevealed(false); return; }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealed(true));
  }

  const totals = staff.reduce(
    (acc, s) => {
      const sAccountsOpened = s.accountsOpened ?? 0;
      const sDepositCount = s.depositCount ?? 0;
      const sPortfolioValue = typeof s.portfolioValue === 'number' ? s.portfolioValue : parseFloat((s.portfolioValue as any) || '0');
      const sMobileOnboarded = s.mobileOnboarded ?? 0;
      return {
        accountsOpened: acc.accountsOpened + sAccountsOpened,
        depositCount: acc.depositCount + sDepositCount,
        portfolioValue: acc.portfolioValue + (isNaN(sPortfolioValue) ? 0 : sPortfolioValue),
        mobileOnboarded: acc.mobileOnboarded + sMobileOnboarded,
      };
    },
    { accountsOpened: 0, depositCount: 0, portfolioValue: 0, mobileOnboarded: 0 }
  );

  const max = Math.max(...staff.map((s) => s.accountsOpened ?? 0), 1);

  return (
    <div className="space-y-3">
      {/* Header + totals */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
          <p className="text-[15px] font-bold text-gray-900">{title}</p>
          <button onClick={handleReveal}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#920793] hover:underline">
            {portfolioRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {portfolioRevealed ? 'Hide' : 'Reveal (PIN)'}
          </button>
        </div>
        <div className="grid grid-cols-4 divide-x divide-gray-50">
          {[
            { label: 'Accounts', value: totals.accountsOpened, color: '#920793' },
            { label: 'Mobile', value: totals.mobileOnboarded, color: '#0284c7' },
            { label: 'Deposits', value: totals.depositCount, color: '#16a34a' },
            { label: 'Portfolio', value: portfolioRevealed ? formatCurrency(totals.portfolioValue) : '••••••', color: '#920793' },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3 text-center">
              <p className="text-[18px] font-black leading-none" style={{ color: item.color }}>{item.value}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Staff cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {staff.map((s) => (
          <StaffCard key={s.staffId} s={s} portfolioRevealed={portfolioRevealed} showRole={showRole} max={max} />
        ))}
      </div>
    </div>
  );
}
