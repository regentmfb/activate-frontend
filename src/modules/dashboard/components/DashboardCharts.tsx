'use client';

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, LineChart, Line, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Eye, EyeOff, ArrowUpRight } from 'lucide-react';
import { formatCurrency, cn } from '@src/utils';
import { StaffPerformanceStat } from '../types/dashboard.types';
import { Task } from '@src/modules/tasks/types/tasks.types';
import { useState } from 'react';

const BRAND = '#920793';
const LINE_COLORS = ['#920793', '#0284c7', '#16a34a', '#d97706', '#b94db9', '#d48ad4'];

// ── Tooltip ───────────────────────────────────────────────────────────────────

function Tip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-[12px] min-w-[140px]">
      {label && <p className="font-bold text-gray-400 mb-2 text-[10px] uppercase tracking-widest">{label}</p>}
      {payload.map((p) => {
        const isDeposit = p.name.toLowerCase().includes('deposit');
        const displayValue = isDeposit ? formatCurrency(p.value) : p.value.toLocaleString();
        return (
          <div key={p.name} className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-gray-500">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
              {p.name}
            </span>
            <span className="font-black text-gray-900">{displayValue}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Trend pill ────────────────────────────────────────────────────────────────

export function TrendPill({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const up = value > 0;
  const flat = value === 0;
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full',
      flat ? 'bg-gray-100 text-gray-500'
        : up ? 'bg-emerald-50 text-emerald-600'
        : 'bg-red-50 text-red-500'
    )}>
      {flat ? <Minus className="h-3 w-3" /> : up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {up ? '+' : ''}{value}{suffix}
    </span>
  );
}

// ── Sparkline data ────────────────────────────────────────────────────────────

const SPARKLINE_ACCOUNTS  = [14, 18, 15, 22, 19, 24];
const SPARKLINE_PORTFOLIO = [9.2, 11.5, 13.8, 12.4, 14.1, 16.05];
const SPARKLINE_MOBILE    = [8, 11, 10, 14, 13, 18];
const SPARKLINE_DEPOSITS  = [6, 9, 8, 12, 11, 15];

// ── Sparkline (mini inline chart) ────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80; const h = 32;
  const step = w / (data.length - 1);
  const coords = data.map((v, i) => ({ x: i * step, y: h - ((v - min) / range) * h }));
  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const area = `${path} L${w},${h} L0,${h} Z`;
  // Use a hash of color + first/last value to avoid SVG id collisions with Recharts gradients
  const id = `spk-${color.replace(/[^a-z0-9]/gi, '')}-${data[0]}-${data[data.length - 1]}`;
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

// ── 1. Top Metric Cards ───────────────────────────────────────────────────────

const PORTFOLIO_DATA = [
  { month: 'Jul', value: 9_200_000 },
  { month: 'Aug', value: 11_500_000 },
  { month: 'Sep', value: 13_800_000 },
  { month: 'Oct', value: 12_400_000 },
  { month: 'Nov', value: 16_050_000 },
];

type HeroProps = {
  portfolioValue: number;
  revealed: boolean;
  onReveal: () => void;
  accountsOpened: number;
  mobileOnboarded: number;
  depositCount: number;
};

// ── Metric Card (white, colored accent) ──────────────────────────────────────
type MetricCardProps = {
  label: string;
  value: string | number;
  trend?: number;
  sub?: string;
  sparkData?: number[];
  sparkColor?: string;
  accentColor?: string;
  // legacy compat
  variant?: string;
  accent?: string;
  accentBg?: string;
  onClick?: () => void;
};

export function MetricCard({
  label, value, trend, sub,
  sparkData, sparkColor, accentColor,
  accent, onClick,
}: MetricCardProps) {
  const color = accentColor ?? accent ?? BRAND;
  const resolvedSparkData = sparkData ?? [3, 5, 4, 7, 6, 8];

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3 transition-all',
        onClick && 'hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5 text-gray-400"
            style={{ color }}>
            {label}
          </p>
          <p className="text-[30px] font-black leading-none text-gray-900">{value}</p>
          {sub && <p className="text-[11px] mt-1.5 text-gray-400">{sub}</p>}
        </div>
        {trend !== undefined && <TrendPill value={trend} />}
      </div>
      <div className="flex items-end justify-end">
        <Sparkline data={resolvedSparkData} color={sparkColor ?? color} />
      </div>
    </button>
  );
}

// Keep HeroPortfolioCard for backward compat with other dashboards
export function HeroPortfolioCard({ portfolioValue, revealed, onReveal, accountsOpened, mobileOnboarded, depositCount }: HeroProps) {
  const latest = PORTFOLIO_DATA[PORTFOLIO_DATA.length - 1].value;
  const prev = PORTFOLIO_DATA[PORTFOLIO_DATA.length - 2].value;
  const pct = Math.round(((latest - prev) / prev) * 100);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-purple-100 shadow-sm"
      style={{ background: 'linear-gradient(135deg, #fdf4ff 0%, #faf5ff 50%, #f5f3ff 100%)' }}>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.07] -translate-y-1/2 translate-x-1/4"
        style={{ background: 'radial-gradient(circle, #920793, transparent)' }} />
      <div className="relative z-10 px-5 pt-6 pb-0">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-2">Total Portfolio Value</p>
            <div className="flex items-end gap-3">
              <p className="text-[38px] md:text-[44px] font-black text-gray-900 leading-none tracking-tight">
                {revealed ? formatCurrency(portfolioValue) : '₦ ••••••••'}
              </p>
              <button onClick={onReveal}
                className="mb-1 h-8 w-8 rounded-xl bg-white/80 border border-purple-100 flex items-center justify-center hover:bg-white transition-colors shadow-sm">
                {revealed ? <EyeOff className="h-3.5 w-3.5 text-purple-500" /> : <Eye className="h-3.5 w-3.5 text-purple-500" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendPill value={pct} />
              <span className="text-[12px] text-gray-400">vs last month</span>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-2 text-right shrink-0">
            {[
              { label: 'Accounts', value: accountsOpened, color: '#920793' },
              { label: 'Mobile', value: mobileOnboarded, color: '#0284c7' },
              { label: 'Deposits', value: depositCount, color: '#16a34a' },
            ].map((s) => (
              <div key={s.label} className="bg-white/70 rounded-xl px-3 py-1.5 border border-white/80">
                <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
                <p className="text-[18px] font-black leading-tight" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={PORTFOLIO_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="hero-portfolio-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.2} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#a78bfa' }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<Tip />} />
          <Area type="monotone" dataKey="value" name="Portfolio" stroke={BRAND} strokeWidth={2.5}
            fill="url(#heroGrad)" dot={false} activeDot={{ r: 5, fill: BRAND, strokeWidth: 0 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 2. Performance Statistics ─────────────────────────────────────────────────

const PERF_DATA = [
  { month: 'Jan', accounts: 12, mobile: 8,  deposits: 6  },
  { month: 'Feb', accounts: 15, mobile: 10, deposits: 8  },
  { month: 'Mar', accounts: 18, mobile: 13, deposits: 10 },
  { month: 'Apr', accounts: 16, mobile: 11, deposits: 9  },
  { month: 'May', accounts: 21, mobile: 15, deposits: 12 },
  { month: 'Jun', accounts: 19, mobile: 14, deposits: 11 },
  { month: 'Jul', accounts: 24, mobile: 18, deposits: 14 },
  { month: 'Aug', accounts: 22, mobile: 16, deposits: 13 },
  { month: 'Sep', accounts: 27, mobile: 20, deposits: 16 },
  { month: 'Oct', accounts: 25, mobile: 19, deposits: 15 },
  { month: 'Nov', accounts: 28, mobile: 21, deposits: 17 },
  { month: 'Dec', accounts: 31, mobile: 24, deposits: 19 },
];

type PerfMetric = 'accounts' | 'mobile' | 'deposits';

const PERF_PILLS: { key: PerfMetric; label: string; color: string }[] = [
  { key: 'accounts', label: 'Accounts', color: BRAND },
  { key: 'mobile',   label: 'Mobile',   color: '#0284c7' },
  { key: 'deposits', label: 'Deposits', color: '#16a34a' },
];

export function PerformanceStatisticsCard() {
  const [active, setActive] = useState<PerfMetric>('accounts');
  const pill = PERF_PILLS.find((p) => p.key === active)!;
  const latest = PERF_DATA[PERF_DATA.length - 1];
  const prev   = PERF_DATA[PERF_DATA.length - 2];
  const trend  = Math.round(((latest[active] - prev[active]) / prev[active]) * 100);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 pt-5 pb-4">
        {/* Title + metric selector */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <p className="text-[15px] font-bold text-gray-900">Performance Statistics</p>
          <div className="flex items-center gap-1.5">
            {PERF_PILLS.map((p) => (
              <button
                key={p.key}
                onClick={() => setActive(p.key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                  active === p.key ? 'text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
                )}
                style={active === p.key ? { backgroundColor: p.color } : undefined}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Single big number for selected metric */}
        <div className="flex items-end gap-3">
          <p className="text-[36px] font-black leading-none text-gray-900">{latest[active]}</p>
          <div className="mb-1">
            <TrendPill value={trend} />
            <p className="text-[11px] text-gray-400 mt-1">vs last month</p>
          </div>
        </div>
      </div>

      {/* Chart — one line, no Y-axis, auto-scaled to data range */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={PERF_DATA} margin={{ top: 8, right: 20, left: 20, bottom: 0 }}>
            <defs>
              <linearGradient id="perf-stat-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={pill.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={pill.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={(['dataMin - 2', 'dataMax + 2'] as unknown as [number, number])} />
            <Tooltip content={<Tip />} />
            <Area
              key={active}
              type="monotone"
              dataKey={active}
              name={pill.label}
              stroke={pill.color}
              strokeWidth={2.5}
              fill="url(#perf-stat-grad)"
              dot={false}
              activeDot={{ r: 5, fill: pill.color, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── 3. Activity Overview ──────────────────────────────────────────────────────

const ACTIVITY_WEEK = [
  { label: 'Mon', accounts: 3, mobile: 2, deposits: 1 },
  { label: 'Tue', accounts: 5, mobile: 3, deposits: 2 },
  { label: 'Wed', accounts: 4, mobile: 4, deposits: 3 },
  { label: 'Thu', accounts: 6, mobile: 3, deposits: 2 },
  { label: 'Fri', accounts: 7, mobile: 5, deposits: 4 },
  { label: 'Sat', accounts: 2, mobile: 1, deposits: 1 },
];

const ACTIVITY_MONTH = [
  { label: 'Jan', accounts: 12, mobile: 8,  deposits: 6  },
  { label: 'Feb', accounts: 15, mobile: 10, deposits: 8  },
  { label: 'Mar', accounts: 18, mobile: 13, deposits: 10 },
  { label: 'Apr', accounts: 16, mobile: 11, deposits: 9  },
  { label: 'May', accounts: 21, mobile: 15, deposits: 12 },
  { label: 'Jun', accounts: 19, mobile: 14, deposits: 11 },
  { label: 'Jul', accounts: 24, mobile: 18, deposits: 14 },
  { label: 'Aug', accounts: 22, mobile: 16, deposits: 13 },
  { label: 'Sep', accounts: 27, mobile: 20, deposits: 16 },
  { label: 'Oct', accounts: 25, mobile: 19, deposits: 15 },
  { label: 'Nov', accounts: 28, mobile: 21, deposits: 17 },
  { label: 'Dec', accounts: 31, mobile: 24, deposits: 19 },
];

const ACTIVITY_YTD = [
  { label: 'Q1', accounts: 52, mobile: 38, deposits: 30 },
  { label: 'Q2', accounts: 61, mobile: 44, deposits: 35 },
  { label: 'Q3', accounts: 58, mobile: 41, deposits: 33 },
  { label: 'Q4', accounts: 72, mobile: 57, deposits: 47 },
];

type ActivityPeriod = 'Week' | 'Month' | 'YTD';

const ACTIVITY_METRICS = [
  { key: 'accounts' as const, label: 'Accounts', color: BRAND },
  { key: 'mobile'   as const, label: 'Mobile',   color: '#0284c7' },
  { key: 'deposits' as const, label: 'Deposits', color: '#16a34a' },
];

export function ActivityOverviewCard() {
  const [period, setPeriod] = useState<ActivityPeriod>('Month');
  const data = period === 'Week' ? ACTIVITY_WEEK : period === 'Month' ? ACTIVITY_MONTH : ACTIVITY_YTD;

  const totals = data.reduce(
    (acc, d) => ({ accounts: acc.accounts + d.accounts, mobile: acc.mobile + d.mobile, deposits: acc.deposits + d.deposits }),
    { accounts: 0, mobile: 0, deposits: 0 }
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        {/* Title + toggle on same row */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[15px] font-bold text-gray-900">Activity Overview</p>
            {/* Totals inline under title */}
            <div className="flex items-center gap-5 mt-1.5">
              {ACTIVITY_METRICS.map((m) => (
                <div key={m.key} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-[12px] font-bold text-gray-700">{totals[m.key]}</span>
                  <span className="text-[12px] text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center rounded-xl overflow-hidden border border-gray-200 shrink-0">
            {(['Week', 'Month', 'YTD'] as ActivityPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  'px-3 py-1.5 text-[12px] font-bold transition-all border-r border-gray-200 last:border-r-0',
                  period === p ? 'text-white' : 'bg-white text-gray-400 hover:text-gray-600'
                )}
                style={period === p ? { backgroundColor: BRAND } : undefined}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barGap={4} barCategoryGap="35%" margin={{ left: 16, right: 16, top: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis hide domain={[0, 'auto']} />
          <Tooltip content={<Tip />} cursor={{ fill: '#f9fafb', radius: 6 }} />
          {ACTIVITY_METRICS.map((m) => (
            <Bar key={m.key} dataKey={m.key} name={m.label} fill={m.color} radius={[4, 4, 0, 0]} maxBarSize={20} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 4. Pending Tasks list card ────────────────────────────────────────────────

const TASK_TYPE_LABELS: Record<string, string> = {
  TIER_2_UPGRADE_PENDING:          'Tier 2 Upgrade',
  TIER_3_UPGRADE_PENDING:          'Tier 3 Upgrade',
  TIER_2_PENDING:                  'Tier 2 Upgrade',
  TIER_3_PENDING:                  'Tier 3 Upgrade',
  PICTURE_UPLOAD_PENDING:          'Photo Upload',
  MANUAL_REVIEW_REQUIRED:          'Manual Review',
  MANUAL_REVIEW_PENDING:           'Manual Review',
  FAILED_VERIFICATION:             'Verification Failed',
  VERIFICATION_FAILED:             'Verification Failed',
  CORRECTION_REQUESTED:            'Correction Needed',
  REJECTED_ACCOUNT_CORRECTION:     'Account Correction',
  REFERENCE_FAILED:                'Reference Failed',
  MIDDLEWARE_FAILED:               'Processing Failed',
  FAILED_MANUAL_REVIEW:            'Failed – Manual Review',
  CUSTOMER_MOBILE_ONBOARDING_PENDING: 'Mobile Onboarding',
  MOBILE_ONBOARDING_PENDING:       'Mobile Onboarding',
  DEPOSIT_FOLLOWUP:                'Deposit Follow-up',
  DEPOSIT_FOLLOW_UP_PENDING:       'Deposit Follow-up',
};

function getTaskSubtitle(task: Task): string {
  if (task.title) return task.title;
  const type = task.taskType ?? '';
  return (TASK_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) || task.status;
}

const PRIORITY_DOT: Record<string, string> = {
  HIGH:   'bg-red-500',
  MEDIUM: 'bg-amber-400',
  LOW:    'bg-gray-300',
};

type PendingTasksCardProps = {
  tasks: Task[];
  onViewAll: () => void;
  onContinue: (task: Task) => void;
};

export function PendingTasksCard({ tasks, onViewAll, onContinue }: PendingTasksCardProps) {
  const shown = tasks.slice(0, 5);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Pending Tasks</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{tasks.length} items need action</p>
        </div>
        <button onClick={onViewAll}
          className="flex items-center gap-1 text-[12px] font-bold text-[#920793] hover:underline">
          View all <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex-1 divide-y divide-gray-50">
        {shown.length === 0 && (
          <p className="px-5 py-8 text-[13px] text-gray-400 text-center">All caught up!</p>
        )}
        {shown.map((task) => (
          <button key={task.id} onClick={() => onContinue(task)}
            className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left group">
            <span className={cn('h-2 w-2 rounded-full shrink-0 mt-0.5', PRIORITY_DOT[task.priority] ?? 'bg-gray-300')} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-gray-900 truncate">{task.customerName}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{getTaskSubtitle(task)}</p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-[#920793] transition-colors shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── 5. Top Performers card ────────────────────────────────────────────────────

export function TopPerformersCard({ staff }: { staff: StaffPerformanceStat[] }) {
  const sorted = [...staff]
    .sort((a, b) => {
      const aAccounts = a.accountsOpened ?? a.accounts ?? 0;
      const bAccounts = b.accountsOpened ?? b.accounts ?? 0;
      return bAccounts - aAccounts;
    })
    .slice(0, 5);
  const max = (sorted[0]?.accountsOpened ?? sorted[0]?.accounts ?? 1);
  const MEDALS = ['🥇', '🥈', '🥉'];

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col h-full"
      style={{ background: 'linear-gradient(160deg, #fdf4ff 0%, #f5e6f5 100%)', border: '1px solid #e9d5e9' }}>
      <div className="px-5 py-4 border-b border-purple-100/70 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Top Performers</p>
          <p className="text-[12px] text-purple-400 mt-0.5">Ranked by accounts opened</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/70 text-[#920793] border border-purple-100">
          {staff.length} staff
        </span>
      </div>
      <div className="flex-1 divide-y divide-purple-100/50">
        {sorted.map((rm, i) => {
          const accounts = rm.accountsOpened ?? rm.accounts ?? 0;
          const pct = Math.round((accounts / max) * 100);
          const name = rm.staffName || rm.rmName || 'Unknown';
          const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
          return (
            <div key={rm.staffId || `${name}-${i}`} className="px-5 py-3.5">
              <div className="flex items-center gap-3">
                <span className="text-base w-5 shrink-0 text-center leading-none">
                  {MEDALS[i] ?? <span className="text-[12px] font-bold text-gray-400">{i + 1}</span>}
                </span>
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0"
                  style={{ backgroundColor: BRAND }}>{initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{name.split(' ')[0]}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="h-1.5 flex-1 bg-purple-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #920793, #b94db9)' }} />
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[18px] font-black leading-none text-[#920793]">{accounts}</p>
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

// ── Legacy: ActivityChart alias (used by TeamLead/CMO/MD dashboards) ──────────
export function ActivityChart() { return <ActivityOverviewCard />; }

// ── 4. Account Type Breakdown ─────────────────────────────────────────────────

const COLORS = ['#920793', '#b94db9', '#d48ad4', '#e8bde8'];

export function AccountTypeBreakdown({ items, total }: { items: { type: string; label: string; count: number }[]; total: number }) {
  const data = items.map((i) => ({ name: i.label, value: i.count }));
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Account Types</p>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0 w-[120px] h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={56}
                paddingAngle={4} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[22px] font-black text-gray-900 leading-none">{total}</span>
            <span className="text-[9px] text-gray-400 font-medium mt-0.5">total</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {items.map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-[12px] text-gray-600 font-medium">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {item.label}
                  </span>
                  <span className="text-[12px] font-black text-gray-900">{item.count}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── 5. Target Progress ────────────────────────────────────────────────────────

export function TargetProgressCard({ label, current, target }: { label: string; current: number; target: number }) {
  const isCurrency = label.toLowerCase().includes('deposit') || label.toLowerCase().includes('portfolio');
  const formatVal = (v: number) => isCurrency ? formatCurrency(v) : String(v);

  const pct = Math.min(Math.round((current / target) * 100), 100);
  const radius = 48;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;
  const remaining = Math.max(target - current, 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0 w-[112px] h-[112px]">
          <svg width="112" height="112" className="-rotate-90">
            <circle cx="56" cy="56" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="9" />
            <circle cx="56" cy="56" r={radius} fill="none" stroke={BRAND} strokeWidth="9"
              strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 6px rgba(146,7,147,0.3))' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[24px] font-black text-gray-900 leading-none">{pct}%</span>
            <span className="text-[9px] text-gray-400 mt-0.5">of target</span>
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <div className="bg-purple-50 rounded-xl px-3 py-2.5">
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wide">Achieved</p>
            <p className="text-[22px] font-black text-gray-900 leading-tight">{formatVal(current)}</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-[10px] text-gray-400 font-medium">Target</p>
              <p className="text-[16px] font-black text-gray-500">{formatVal(target)}</p>
            </div>
            <div className="flex-1 rounded-xl px-3 py-2" style={{ backgroundColor: remaining === 0 ? '#f0fdf4' : '#fdf4ff' }}>
              <p className="text-[10px] font-medium" style={{ color: remaining === 0 ? '#16a34a' : '#920793' }}>Left</p>
              <p className="text-[16px] font-black" style={{ color: remaining === 0 ? '#16a34a' : '#920793' }}>{remaining}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 6. Team Stats Card (replaces RM Breakdown) ───────────────────────────────

type TeamStatsCardProps = {
  staff: StaffPerformanceStat[];
  title?: string;
  accountTarget?: number;
  mobileTarget?: number;
  depositTarget?: number;
};

export function TeamStatsCard({
  staff,
  title = 'Team Stats',
  accountTarget,
  mobileTarget,
  depositTarget,
}: TeamStatsCardProps) {
  const totals = staff.reduce(
    (acc, s) => ({
      accounts: acc.accounts + (s.accountsOpened ?? s.accounts ?? 0),
      mobile:   acc.mobile   + (s.mobileOnboarded ?? 0),
      deposits: acc.deposits + (s.depositCount ?? s.deposits ?? 0),
    }),
    { accounts: 0, mobile: 0, deposits: 0 }
  );

  const aTarget  = accountTarget  ?? Math.ceil(totals.accounts  * 1.25);
  const mTarget  = mobileTarget   ?? Math.ceil(totals.mobile    * 1.25);
  const dTarget  = depositTarget  ?? Math.ceil(totals.deposits  * 1.25);

  const rows = [
    { label: 'Accounts Opened', value: totals.accounts, target: aTarget,  color: BRAND,     bg: '#fdf4ff' },
    { label: 'Mobile Onboarded', value: totals.mobile,   target: mTarget,  color: '#0284c7', bg: '#eff6ff' },
    { label: 'Deposits',         value: totals.deposits,  target: dTarget,  color: '#16a34a', bg: '#f0fdf4' },
  ];

  const avgPct = Math.round(rows.reduce((s, r) => s + Math.min((r.value / r.target) * 100, 100), 0) / rows.length);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
        <div>
          <p className="text-[15px] font-bold text-gray-900">{title}</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{staff.length} staff · monthly targets</p>
        </div>
        {/* Overall completion ring */}
        <div className="relative h-12 w-12 shrink-0">
          <svg width="48" height="48" className="-rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#f3f4f6" strokeWidth="5" />
            <circle cx="24" cy="24" r="20" fill="none" stroke={BRAND} strokeWidth="5"
              strokeDasharray={`${(avgPct / 100) * (2 * Math.PI * 20)} ${2 * Math.PI * 20}`}
              strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-black text-gray-900">{avgPct}%</span>
          </div>
        </div>
      </div>

      {/* Metric rows */}
      <div className="px-5 py-4 space-y-5">
        {rows.map((r) => {
          const pct = Math.min(Math.round((r.value / r.target) * 100), 100);
          return (
            <div key={r.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-[12px] font-semibold text-gray-600">{r.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-black text-gray-900">
                    {r.label === 'Deposits' ? formatCurrency(r.value) : r.value}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    / {r.label === 'Deposits' ? formatCurrency(r.target) : r.target}
                  </span>
                  <span className="text-[11px] font-bold" style={{ color: r.color }}>{pct}%</span>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: r.color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Keep aliases for backward compat
export function TeamSummaryCard({ staff, title }: { staff: StaffPerformanceStat[]; title?: string }) {
  return <TeamStatsCard staff={staff} title={title} />;
}
export function RmLeaderboard({ staff }: { staff: StaffPerformanceStat[] }) {
  return <TeamStatsCard staff={staff} title="RM Stats" />;
}

// ── 7. Team Comparison ────────────────────────────────────────────────────────

export function TeamComparisonChart({ data }: { data: { name: string; accounts: number; mobile: number; deposits: number }[] }) {
  // Recharts BarChart with layout="vertical" gives a proper horizontal bar chart
  // Height scales with number of teams so it never gets cramped
  const rowHeight = 52;
  const chartHeight = data.length * rowHeight + 40;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-2 flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Team Comparison</p>
          <p className="text-[12px] text-gray-400 mt-0.5">{data.length} teams</p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { label: 'Accounts', color: BRAND },
            { label: 'Mobile',   color: '#0284c7' },
            { label: 'Deposits', color: '#16a34a' },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          barGap={3}
          barCategoryGap="30%"
          margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            domain={[0, 'auto']}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
            width={72}
          />
          <Tooltip content={<Tip />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="accounts" name="Accounts" fill={BRAND}    radius={[0, 4, 4, 0]} maxBarSize={14} />
          <Bar dataKey="mobile"   name="Mobile"   fill="#0284c7"  radius={[0, 4, 4, 0]} maxBarSize={14} />
          <Bar dataKey="deposits" name="Deposits"  fill="#16a34a"  radius={[0, 4, 4, 0]} maxBarSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 8. Bank-wide bar chart ────────────────────────────────────────────────────

export function BankWideBarChart({ data }: { data: { name: string; accounts: number; mobile: number; deposits: number }[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bank-Wide Performance</p>
        <p className="text-[12px] text-gray-400 mt-0.5">Accounts opened per CMO directorate</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barGap={6} barCategoryGap="35%" margin={{ left: 8, right: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<Tip />} cursor={{ fill: '#fdf4ff', radius: 8 }} />
          <Bar dataKey="accounts" name="Accounts" fill={BRAND} radius={[6, 6, 0, 0]} maxBarSize={48} />
          <Bar dataKey="mobile" name="Mobile" fill="#0284c7" radius={[6, 6, 0, 0]} maxBarSize={48} />
          <Bar dataKey="deposits" name="Deposits" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 9. RM Multi-line Trend Chart ─────────────────────────────────────────────

const RM_TREND_DATA = [
  { month: 'Jul', Adaeze: 14, Emeka: 10, Fatima: 18, Chukwudi: 8, Ngozi: 12, Tunde: 5 },
  { month: 'Aug', Adaeze: 16, Emeka: 12, Fatima: 22, Chukwudi: 9, Ngozi: 14, Tunde: 6 },
  { month: 'Sep', Adaeze: 20, Emeka: 14, Fatima: 26, Chukwudi: 11, Ngozi: 17, Tunde: 7 },
  { month: 'Oct', Adaeze: 22, Emeka: 16, Fatima: 28, Chukwudi: 12, Ngozi: 18, Tunde: 8 },
  { month: 'Nov', Adaeze: 24, Emeka: 18, Fatima: 31, Chukwudi: 14, Ngozi: 20, Tunde: 9 },
];

export function RmTrendChart({ rmNames }: { rmNames: string[] }) {
  const names = rmNames.length > 0 ? rmNames : ['Adaeze', 'Emeka', 'Fatima'];
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <p className="text-[15px] font-bold text-gray-900">RM Performance Trend</p>
        <p className="text-[12px] text-gray-400 mt-0.5">Accounts opened per RM over 5 months</p>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={RM_TREND_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<Tip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          {names.map((name, i) => (
            <Line key={name} type="monotone" dataKey={name} stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── 10. RM Radar Chart ────────────────────────────────────────────────────────

export function RmRadarChart({ rms, teamLeads }: { rms: StaffPerformanceStat[]; teamLeads: StaffPerformanceStat[] }) {
  const [role, setRole] = useState<'RMs' | 'Team Leads'>('RMs');
  
  const staff = role === 'RMs' ? rms : teamLeads;

  if (staff.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full justify-between min-h-[300px]">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Performance Radar</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Relative comparison across all metrics</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-[13px] text-gray-400">No data available for this selection</p>
        </div>
      </div>
    );
  }

  const maxAccounts = Math.max(...staff.map((s) => s.accountsOpened ?? s.accounts ?? 0), 1);
  const maxMobile = Math.max(...staff.map((s) => s.mobileOnboarded ?? 0), 1);
  const maxDeposits = Math.max(...staff.map((s) => s.depositCount ?? s.deposits ?? 0), 1);

  const data = [
    { metric: 'Accounts', ...Object.fromEntries(staff.map((s) => [(s.staffName || s.rmName || 'Unknown').split(' ')[0], Math.round(((s.accountsOpened ?? s.accounts ?? 0) / maxAccounts) * 100)])) },
    { metric: 'Mobile', ...Object.fromEntries(staff.map((s) => [(s.staffName || s.rmName || 'Unknown').split(' ')[0], Math.round(((s.mobileOnboarded ?? 0) / maxMobile) * 100)])) },
    { metric: 'Deposits', ...Object.fromEntries(staff.map((s) => [(s.staffName || s.rmName || 'Unknown').split(' ')[0], Math.round(((s.depositCount ?? s.deposits ?? 0) / maxDeposits) * 100)])) },
  ];

  const names = staff.map((s) => (s.staffName || s.rmName || 'Unknown').split(' ')[0]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full justify-between min-h-[300px]">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Performance Radar</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Relative strength (% of best)</p>
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'RMs' | 'Team Leads')}
          className="h-8 rounded-lg border border-gray-200 px-2.5 text-[11px] font-bold text-gray-700 bg-gray-50 outline-none focus:border-[#920793] transition-colors cursor-pointer"
        >
          <option value="RMs">RMs</option>
          <option value="Team Leads">Team Leads</option>
        </select>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[220px]">
        <ResponsiveContainer width="100%" height={230}>
          <RadarChart data={data} margin={{ top: 8, right: 28, left: 28, bottom: 8 }}>
            <PolarGrid stroke="#f3f4f6" />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }} />
            <Tooltip content={<Tip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
            {names.map((name, i) => (
              <Radar key={name} name={name} dataKey={name}
                stroke={LINE_COLORS[i % LINE_COLORS.length]}
                fill={LINE_COLORS[i % LINE_COLORS.length]}
                fillOpacity={0.06} strokeWidth={2} />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── 11. Staff Grouped Bar Chart ───────────────────────────────────────────────

function formatCompactValue(v: number, isDeposit: boolean) {
  if (!isDeposit) return v.toLocaleString();
  if (v >= 1_000_000_000) return `₦${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `₦${(v / 1_000).toFixed(1)}K`;
  return `₦${v}`;
}

export function StaffBarChart({ data, title, subtitle, typeLabel = 'RMs' }: {
  data: { name: string; accounts: number; mobile: number; deposits: number }[];
  title: string;
  subtitle?: string;
  typeLabel?: string;
}) {
  const [metric, setMetric] = useState<'all' | 'accounts' | 'mobile' | 'deposits'>('all');
  // All RMs selected by default
  const [selectedRms, setSelectedRms] = useState<Set<string>>(() => new Set(data.map((d) => d.name)));
  const [showRmFilter, setShowRmFilter] = useState(false);

  const METRICS = [
    { key: 'all'      as const, label: 'All',      color: BRAND },
    { key: 'accounts' as const, label: 'Accounts', color: BRAND },
    { key: 'mobile'   as const, label: 'Mobile',   color: '#0284c7' },
    { key: 'deposits' as const, label: 'Deposits', color: '#16a34a' },
  ];

  const filteredData = data.filter((d) => selectedRms.has(d.name));

  const maxVal = Math.max(
    ...filteredData.flatMap((d) =>
      metric === 'all' ? [d.accounts, d.mobile, d.deposits] : [d[metric]]
    ),
    1
  );
  const domainMax = Math.ceil(maxVal / 5) * 5 || 5;

  function toggleRm(name: string) {
    setSelectedRms((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        // Don't allow deselecting the last one
        if (next.size === 1) return prev;
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  }

  function selectAll() { setSelectedRms(new Set(data.map((d) => d.name))); }
  function clearAll() {
    // Keep at least the first
    if (data.length > 0) setSelectedRms(new Set([data[0].name]));
  }

  const formatYAxis = (v: number) => {
    if (metric === 'deposits') {
      return formatCompactValue(v, true);
    }
    if (metric === 'all') {
      return v >= 1000 ? formatCompactValue(v, true) : v.toLocaleString();
    }
    return v.toLocaleString();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-gray-900">{title}</p>
          {subtitle && <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Metric filter */}
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all',
                metric === m.key ? 'text-white' : 'bg-gray-100 text-gray-400 hover:text-gray-600'
              )}
              style={metric === m.key ? { backgroundColor: m.color } : undefined}
            >
              {m.label}
            </button>
          ))}
          {/* RM filter toggle — only show when there are multiple RMs */}
          {data.length > 1 && (
            <button
              onClick={() => setShowRmFilter((v) => !v)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border',
                showRmFilter
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              )}
            >
              {typeLabel} {selectedRms.size < data.length ? `(${selectedRms.size})` : ''}
            </button>
          )}
        </div>
      </div>

      {/* RM selector panel */}
      {showRmFilter && data.length > 1 && (
        <div className="mx-5 mb-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Compare {typeLabel}</p>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-[11px] font-semibold text-[#920793] hover:underline">
                All
              </button>
              <span className="text-gray-300">·</span>
              <button onClick={clearAll} className="text-[11px] font-semibold text-gray-400 hover:underline">
                Clear
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.map((d, i) => {
              const selected = selectedRms.has(d.name);
              const COLOR = LINE_COLORS[i % LINE_COLORS.length];
              return (
                <button
                  key={d.name}
                  onClick={() => toggleRm(d.name)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold border transition-all',
                    selected
                      ? 'text-white border-transparent'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  )}
                  style={selected ? { backgroundColor: COLOR, borderColor: COLOR } : undefined}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: selected ? 'white' : COLOR }}
                  />
                  {d.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={filteredData} barGap={4} barCategoryGap="32%" margin={{ left: 4, right: 12, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f9fafb" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={metric === 'deposits' || (metric === 'all' && maxVal >= 1000) ? 54 : 32}
            tickFormatter={formatYAxis}
            allowDecimals={false}
            domain={[0, domainMax]}
          />
          <Tooltip content={<Tip />} cursor={{ fill: '#fdf4ff' }} />
          {metric === 'all' && (
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
          )}
          {(metric === 'all' || metric === 'accounts') && (
            <Bar dataKey="accounts" name="Accounts" fill={BRAND}     radius={[5, 5, 0, 0]} maxBarSize={40} />
          )}
          {(metric === 'all' || metric === 'mobile') && (
            <Bar dataKey="mobile"   name="Mobile"   fill="#0284c7"   radius={[5, 5, 0, 0]} maxBarSize={40} />
          )}
          {(metric === 'all' || metric === 'deposits') && (
            <Bar dataKey="deposits" name="Deposits" fill="#16a34a"   radius={[5, 5, 0, 0]} maxBarSize={40} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Branch Performance Pie Chart ──────────────────────────────────────────────

type BranchPerformanceItem = {
  branchId: string;
  branchName: string;
  accounts: number;
  mobileOnboarded: number;
  deposits: number;
};

type BranchMetricType = 'accounts' | 'mobile' | 'deposits';

export function BranchPerformancePieChart({ branches }: { branches: BranchPerformanceItem[] }) {
  const [metric, setMetric] = useState<BranchMetricType>('accounts');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const getMetricValue = (item: BranchPerformanceItem) => {
    if (metric === 'mobile') return item.mobileOnboarded;
    if (metric === 'deposits') return item.deposits;
    return item.accounts;
  };

  const formattedValue = (val: number) => {
    if (metric === 'deposits') return formatCurrency(val);
    return val.toLocaleString();
  };

  const chartData = branches
    .map((b) => ({
      name: b.branchName.replace(' Branch', '').replace(' Directorate', '').replace(' Outlet', ''),
      value: getMetricValue(b),
    }))
    .filter((d) => d.value > 0);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  // Fallback if no data is present
  if (branches.length === 0 || total === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full justify-between">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Branch Performance</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Distribution across branches</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-[13px] text-gray-400">No branch data available for this selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col h-full justify-between min-h-[360px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-[15px] font-bold text-gray-900">Branch Performance</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Distribution across branches</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 self-start sm:self-auto">
          {(['accounts', 'mobile', 'deposits'] as BranchMetricType[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMetric(m);
                setActiveIndex(-1);
              }}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all',
                metric === m ? 'bg-white text-[#920793] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              {m === 'mobile' ? 'Mobile' : m === 'deposits' ? 'Deposits' : 'Accounts'}
            </button>
          ))}
        </div>
      </div>

      {/* Donut Container */}
      <div className="relative h-[200px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              paddingAngle={4}
              dataKey="value"
              strokeWidth={0}
              cornerRadius={6}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {chartData.map((_, i) => {
                const isHovered = activeIndex === i;
                return (
                  <Cell
                    key={i}
                    fill={LINE_COLORS[i % LINE_COLORS.length]}
                    style={{
                      filter: isHovered
                        ? `drop-shadow(0 0 8px ${LINE_COLORS[i % LINE_COLORS.length]}80)`
                        : 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[28px] font-black text-gray-900 leading-none transition-all duration-300">
            {activeIndex >= 0
              ? (metric === 'deposits'
                  ? formatCurrency(chartData[activeIndex].value).replace('₦', '')
                  : chartData[activeIndex].value.toLocaleString())
              : (metric === 'deposits'
                  ? formatCurrency(total).replace('₦', '')
                  : total.toLocaleString())}
          </span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 transition-all duration-300">
            {activeIndex >= 0 ? chartData[activeIndex].name : (metric === 'deposits' ? 'Total ₦' : 'Total')}
          </span>
        </div>
      </div>

      {/* Legend Grid */}
      <div className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5 justify-center">
        {chartData.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const COLOR = LINE_COLORS[i % LINE_COLORS.length];
          const isHovered = activeIndex === i;
          return (
            <button
              key={item.name}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(-1)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all',
                isHovered
                  ? 'border-gray-200 bg-gray-50 shadow-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLOR }} />
              <span>{item.name}</span>
              <span className="text-gray-400 font-normal">({pct}%)</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
