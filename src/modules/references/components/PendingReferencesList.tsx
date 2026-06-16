'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { DataView, ColumnDef } from '@/src/components/ui/DataView';
import { usePendingReferences } from '../hooks/useReferences';
import { cn } from '@/src/utils';
import type { ReferenceRecord } from '../types/references.types';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:      { label: 'Pending Review', icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50' },
  PASSED:       { label: 'Approved',       icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  FAILED:       { label: 'Rejected',       icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50' },
  UNDER_REVIEW: { label: 'Under Review',   icon: Clock,       color: 'text-blue-600',  bg: 'bg-blue-50' },
};
const DEFAULT_STATUS = { label: 'Unknown', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' };

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? DEFAULT_STATUS;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ── Group references by activateRequestId ─────────────────────────────────────

type AccountGroup = {
  id: string; // activateRequestId used as key
  activateRequestId: string;
  requestNumber: string;
  accountType: string;
  customerName: string;
  rmName: string;
  createdAt: string;
  pendingCount: number;
  passedCount: number;
  failedCount: number;
  total: number;
};

function groupByAccount(references: ReferenceRecord[]): AccountGroup[] {
  // Ensure references is always an array
  const referencesArray = Array.isArray(references) ? references : [];
  const map = new Map<string, AccountGroup>();

  for (const ref of referencesArray) {
    const key = ref.activateRequestId;
    const req = ref.accountRequest;
    const cust = ref.customer;
    const customerName = [cust.firstName, cust.middleName, cust.lastName].filter(Boolean).join(' ');

    if (!map.has(key)) {
      map.set(key, {
        id: key,
        activateRequestId: key,
        requestNumber: req.requestNumber,
        accountType: `${req.accountCategory} ${req.accountType}`,
        customerName,
        rmName: req.rm.staffName,
        createdAt: req.createdAt,
        pendingCount: 0,
        passedCount: 0,
        failedCount: 0,
        total: 0,
      });
    }

    const group = map.get(key)!;
    group.total++;
    if (ref.status === 'PENDING') group.pendingCount++;
    else if (ref.status === 'PASSED') group.passedCount++;
    else if (ref.status === 'FAILED') group.failedCount++;
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// ── Card render ───────────────────────────────────────────────────────────────

function AccountGroupCard({ group }: { group: AccountGroup }) {
  const router = useRouter();
  const initials = group.customerName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <button
      onClick={() => router.push(`/operations/references/${group.activateRequestId}`)}
      className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow active:scale-[0.98] text-left"
    >
      <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[14px] font-semibold text-gray-900">{group.customerName}</p>
          {group.pendingCount > 0 && <StatusBadge status="PENDING" />}
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5 capitalize">{group.accountType.toLowerCase()} · {group.requestNumber}</p>
        <div className="flex items-center gap-3 mt-1.5">
          {group.pendingCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <Clock className="h-3 w-3" /> {group.pendingCount} pending
            </span>
          )}
          {group.passedCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
              <CheckCircle className="h-3 w-3" /> {group.passedCount} approved
            </span>
          )}
          {group.failedCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-red-600">
              <XCircle className="h-3 w-3" /> {group.failedCount} rejected
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
    </button>
  );
}

// ── Table columns ─────────────────────────────────────────────────────────────

function AccountGroupColumns(router: ReturnType<typeof useRouter>): ColumnDef<AccountGroup>[] {
  return [
    {
      key: 'customer',
      header: 'Customer',
      render: (g) => {
        const initials = g.customerName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>{initials}</div>
            <div>
              <p className="font-medium text-gray-900 whitespace-nowrap">{g.customerName}</p>
              <p className="text-[11px] text-gray-400">{g.requestNumber}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'accountType',
      header: 'Account Type',
      render: (g) => <span className="text-gray-500 capitalize whitespace-nowrap">{g.accountType.toLowerCase()}</span>,
    },
    {
      key: 'rm',
      header: 'RM',
      render: (g) => <span className="text-gray-600 whitespace-nowrap">{g.rmName}</span>,
    },
    {
      key: 'references',
      header: 'References',
      render: (g) => (
        <div className="flex items-center gap-2">
          {g.pendingCount > 0 && <span className="text-[11px] font-semibold text-amber-600">{g.pendingCount} pending</span>}
          {g.passedCount > 0 && <span className="text-[11px] font-semibold text-green-600">{g.passedCount} approved</span>}
          {g.failedCount > 0 && <span className="text-[11px] font-semibold text-red-600">{g.failedCount} rejected</span>}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Submitted',
      render: (g) => <span className="text-[13px] text-gray-400 whitespace-nowrap">{new Date(g.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>,
    },
    {
      key: 'action',
      header: '',
      render: (g) => (
        <button
          onClick={() => router.push(`/operations/references/${g.activateRequestId}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap"
        >
          Review <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export function PendingReferencesList() {
  const router = useRouter();
  const { data: references = [], isLoading } = usePendingReferences();
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'PASSED' | 'FAILED'>('all');

  // Ensure references is always an array before using array methods
  const referencesArray = Array.isArray(references) ? references : [];

  const filtered = filter === 'all' ? referencesArray : referencesArray.filter(r => r.status === filter);
  const groups = groupByAccount(filtered);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all',    label: 'All',      count: referencesArray.length },
          { key: 'PENDING', label: 'Pending',  count: referencesArray.filter(r => r.status === 'PENDING').length },
          { key: 'PASSED',  label: 'Approved', count: referencesArray.filter(r => r.status === 'PASSED').length },
          { key: 'FAILED',  label: 'Rejected', count: referencesArray.filter(r => r.status === 'FAILED').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors',
              filter === tab.key
                ? 'bg-[#920793] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#920793] hover:text-[#920793]'
            )}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <DataView
        data={groups}
        columns={AccountGroupColumns(router)}
        renderCard={(group) => <AccountGroupCard group={group} />}
        keyExtractor={(g) => g.id}
        title={`${groups.length} ${groups.length === 1 ? 'Account' : 'Accounts'}`}
        emptyMessage="No references found."
        isLoading={isLoading}
        gridCols="grid-cols-1 sm:grid-cols-2"
      />
    </div>
  );
}
