'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, TrendingUp } from 'lucide-react';
import { useAuthStore } from '@src/store/auth.store';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useTaskBank } from '@src/modules/tasks/hooks/useTaskBank';
import { Task } from '@src/modules/tasks/types/tasks.types';
import { PermissionGate } from '@src/components/ui/PermissionGate';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { PendingTasksCard, TargetProgressCard } from './DashboardCharts';
import { PeriodSelector, PeriodFilter } from './PeriodSelector';
import { ROUTES } from '@src/constants/routes';

const SPARKLINE_ACCOUNTS  = [14, 18, 15, 22, 19, 24];
const SPARKLINE_PORTFOLIO = [9.2, 11.5, 13.8, 12.4, 14.1, 16.05];
const SPARKLINE_MOBILE    = [8, 11, 10, 14, 13, 18];
const SPARKLINE_DEPOSITS  = [6, 9, 8, 12, 11, 15];

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 32;
  const step = w / (data.length - 1);
  const coords = data.map((v, i) => ({ x: i * step, y: h - ((v - min) / range) * h }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  const id = `rm-spk-${color.replace(/[^a-z0-9]/gi, '')}-${data[0]}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  sparkData: number[];
  color: string;
  onClick?: () => void;
};

function StatCard({ label, value, sub, sparkData, color, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-2',
        onClick && 'hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.98]'
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color }}>{label}</p>
      <p className="text-[28px] font-black leading-none text-gray-900">{value}</p>
      <div className="flex items-end justify-between mt-auto">
        {sub
          ? <p className="text-[11px] text-gray-400">{sub}</p>
          : <span />
        }
        <Sparkline data={sparkData} color={color} />
      </div>
    </button>
  );
}

export function RmDashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<PeriodFilter>({ period: 'month' });
  const { summary, isLoading, isFetching } = useDashboardSummary(filter);
  const { tasks } = useTaskBank();
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

  const accountsOpened  = summary.accountsOpened ?? summary.accountCount ?? 0;
  const mobileOnboarded = summary.mobileOnboarded ?? summary.mobileCount ?? 0;
  const depositCount    = summary.depositCount ?? summary.depositsCount ?? summary.deposits ?? 0;
  const portfolioRaw    = summary.portfolioValue;
  const weeklyIncrement = summary.weeklyIncrement ?? '';

  const portfolioDisplay = portfolioRevealed && portfolioRaw
    ? (typeof portfolioRaw === 'number' ? formatCurrency(portfolioRaw) : String(portfolioRaw))
    : '₦ ••••••';

  const tp = summary.targetsProgress;
  const accountTarget = tp?.accounts?.target ?? 50;
  const mobileTarget  = tp?.mobile?.target   ?? 40;
  const depositTarget = tp?.deposits?.target ?? 35;

  // Pending tasks from dashboard response, fall back to task bank
  const dashboardTasks: Task[] = Array.isArray(summary.pendingTasksList)
    ? summary.pendingTasksList.map((t): Task => ({
        id: t.id,
        customerName: t.customerName || t.customerId || 'Unknown',
        accountType:  'INDIVIDUAL_SAVINGS',
        status:       t.status as Task['status'],
        priority:     (t.priority ?? 'MEDIUM') as Task['priority'],
        updatedAt:    t.updatedAt ?? t.createdAt,
        createdAt:    t.createdAt,
        requestId:    t.activateRequestId || '',
        title:        t.title,
        description:  t.description,
        taskType:     t.taskType,
        customerId:   t.customerId || undefined,
        activateRequestId: t.activateRequestId || undefined,
        assignedTo:   t.assignedTo,
      }))
    : tasks.slice(0, 5);

  // Use the length of the embedded task list as pending count — more accurate than totalPendingTasks
  const totalPending = dashboardTasks.filter(t =>
    t.status === 'PENDING_ACTION' || t.status === 'PENDING_REVIEW' ||
    t.status === 'PENDING_UPLOAD' || t.status === 'PENDING_VERIFICATION'
  ).length || dashboardTasks.length;

  const pb = summary.productBreakdown;
  const savingsCount = pb?.savings ?? 0;
  const currentCount = pb?.current ?? 0;

  return (
    <div className="space-y-5">
      {/* Subtle top bar while refetching */}
      {isFetching && (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5 overflow-hidden">
          <div className="h-full animate-pulse" style={{ backgroundColor: '#920793', width: '100%' }} />
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Good day, {firstName} 👋</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Here&apos;s your performance overview.
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

      {/* ── Data rows — fade while refetching ── */}
      <div className={cn('space-y-5 transition-opacity duration-300', isFetching && 'opacity-50 pointer-events-none')}>

      {/* ── Row 1: 4 stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Accounts Opened"
          value={accountsOpened}
          sub={`Target: ${accountTarget}`}
          sparkData={SPARKLINE_ACCOUNTS}
          color="#920793"
          onClick={() => router.push('/customers')}
        />
        <StatCard
          label="Portfolio Value"
          value={portfolioDisplay}
          sub="Tap to reveal"
          sparkData={SPARKLINE_PORTFOLIO}
          color="#920793"
          onClick={handleRevealPortfolio}
        />
        <StatCard
          label="Mobile Onboarded"
          value={mobileOnboarded}
          sub={`Target: ${mobileTarget}`}
          sparkData={SPARKLINE_MOBILE}
          color="#0284c7"
          onClick={() => router.push('/customers')}
        />
        <StatCard
          label="Deposits (Portfolio)"
          value={formatCurrency(depositCount)}
          sub={`Target: ${formatCurrency(depositTarget)}`}
          sparkData={SPARKLINE_DEPOSITS}
          color="#16a34a"
          onClick={() => router.push('/customers')}
        />
      </div>

      {/* ── Row 2: Monthly Targets ── */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Monthly Targets</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TargetProgressCard
            label="Accounts Target"
            current={tp?.accounts?.current ?? accountsOpened}
            target={accountTarget}
          />
          <TargetProgressCard
            label="Mobile Target"
            current={tp?.mobile?.current ?? mobileOnboarded}
            target={mobileTarget}
          />
          <TargetProgressCard
            label="Deposit / Portfolio Target"
            current={tp?.deposits?.current ?? depositCount}
            target={depositTarget}
          />
        </div>
      </div>

      {/* ── Row 3: Pending Tasks + Product Breakdown (equal height) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
        <div className="lg:col-span-3 flex flex-col">
          <PendingTasksCard
            tasks={dashboardTasks}
            onViewAll={() => router.push(ROUTES.tasks)}
            onContinue={(task: Task) => router.push(ROUTES.taskDetail(task.id))}
          />
        </div>
        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col flex-1">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-50">
              <p className="text-[15px] font-bold text-gray-900">Product Breakdown</p>
              <p className="text-[12px] text-gray-400 mt-0.5">{savingsCount + currentCount} total accounts</p>
            </div>

            {/* Donut chart + legend */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 gap-5">
              {/* SVG Donut */}
              {(() => {
                const total = savingsCount + currentCount || 1;
                const items = [
                  { label: 'Savings', count: savingsCount, color: '#920793' },
                  { label: 'Current', count: currentCount, color: '#0284c7' },
                ];
                const r = 56;
                const circ = 2 * Math.PI * r;
                let offset = 0;
                const segments = items.map((item) => {
                  const pct = item.count / total;
                  const dash = pct * circ;
                  const seg = { ...item, dash, offset, pct: Math.round(pct * 100) };
                  offset += dash;
                  return seg;
                });
                return (
                  <>
                    <div className="relative w-36 h-36 shrink-0">
                      <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
                        {/* Track */}
                        <circle cx="72" cy="72" r={r} fill="none" stroke="#f3f4f6" strokeWidth="18" />
                        {/* Segments */}
                        {segments.map((seg) => (
                          <circle
                            key={seg.label}
                            cx="72" cy="72" r={r}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth="18"
                            strokeDasharray={`${seg.dash} ${circ}`}
                            strokeDashoffset={-seg.offset}
                            strokeLinecap="butt"
                          />
                        ))}
                      </svg>
                      {/* Centre label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[26px] font-black text-gray-900 leading-none">{savingsCount + currentCount}</span>
                        <span className="text-[10px] text-gray-400 font-medium mt-0.5">accounts</span>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="w-full space-y-2.5">
                      {segments.map((seg) => (
                        <div key={seg.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-[13px] font-semibold text-gray-700">{seg.label} Accounts</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[13px] font-black text-gray-900">{seg.count}</span>
                            <span className="text-[11px] text-gray-400 ml-1.5">{seg.pct}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
      </div>{/* end data rows */}
    </div>
  );
}
