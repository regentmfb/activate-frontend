'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle, XCircle, AlertTriangle, User } from 'lucide-react';
import { DataView, ColumnDef } from '@/src/components/ui/DataView';
import { useComplianceAccounts } from '../hooks/useWorkflow';
import { ACCOUNT_TYPE_LABELS } from '@/src/constants/labels';
import { cn } from '@/src/utils';
import type { ComplianceAccountRequest } from '../types/workflow.types';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:           { label: 'Pending Review',    icon: Clock,          color: 'text-amber-600', bg: 'bg-amber-50' },
  PROCESSING:        { label: 'Processing',        icon: Clock,          color: 'text-blue-600',  bg: 'bg-blue-50' },
  SUBMITTED:         { label: 'Submitted',         icon: Clock,          color: 'text-blue-600',  bg: 'bg-blue-50' },
  COMPLETED:         { label: 'Completed',         icon: CheckCircle,    color: 'text-green-600', bg: 'bg-green-50' },
  REVIEWED:          { label: 'Reviewed',          icon: CheckCircle,    color: 'text-green-600', bg: 'bg-green-50' },
  REJECTED:          { label: 'Rejected',          icon: XCircle,        color: 'text-red-600',   bg: 'bg-red-50' },
  COMPLETED_REVIEW:  { label: 'Review Complete',   icon: CheckCircle,    color: 'text-green-600', bg: 'bg-green-50' },
  NON_COMPLIANT:     { label: 'Non-Compliant',     icon: XCircle,        color: 'text-red-600',   bg: 'bg-red-50' },
  LIEN_PLACED:       { label: 'Lien Placed',       icon: AlertTriangle,  color: 'text-orange-600',bg: 'bg-orange-50' },
};

const DEFAULT_STATUS = { label: 'Unknown', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' };

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    ...DEFAULT_STATUS,
    label: status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown',
  };
  const Icon = config.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.bg, config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function VerificationBadge({ type, status }: { type: string; status: string }) {
  const isOk = status === 'COMPLETED' || status === 'BIODATA_CONFIRMED' || status === 'PICTURE_VERIFIED';
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
      isOk ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
    )}>
      {type} · {status.replace(/_/g, ' ')}
    </span>
  );
}

function AccountCard({ account }: { account: ComplianceAccountRequest }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/workflow/compliance/${account.id}`)}
      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{account.requestNumber}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {ACCOUNT_TYPE_LABELS[`${account.accountCategory}_${account.accountType}`] || `${account.accountCategory} ${account.accountType}`}
          </p>
        </div>
        <StatusBadge status={account.status} />
      </div>

      {account.customer && (
        <div className="flex items-center gap-1.5 mb-2">
          <User className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-sm font-medium text-gray-900">{account.customer.fullName || '—'}</p>
          {account.customer.phoneNumber && (
            <p className="text-xs text-gray-500">· {account.customer.phoneNumber}</p>
          )}
        </div>
      )}

      {account.verification && (
        <div className="mb-2">
          <VerificationBadge type={account.verification.type} status={account.verification.status} />
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>{account.rm?.staffName ? `RM: ${account.rm.staffName}` : ''}</span>
        <span>{new Date(account.createdAt).toLocaleDateString()}</span>
      </div>

      {/* account.failureReason && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-700">{account.failureReason}</p>
        </div>
      ) */}
    </div>
  );
}

const columns: ColumnDef<ComplianceAccountRequest>[] = [
  {
    key: 'requestNumber',
    header: 'Request',
    render: (account) => (
      <div>
        <p className="font-medium text-gray-900">{account.requestNumber}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {ACCOUNT_TYPE_LABELS[`${account.accountCategory}_${account.accountType}`] || `${account.accountCategory} ${account.accountType}`}
        </p>
      </div>
    ),
  },
  {
    key: 'customer',
    header: 'Customer',
    render: (account) => (
      <div>
        <p className="text-sm font-medium text-gray-900">{account.customer?.fullName || '—'}</p>
        {account.customer?.phoneNumber && (
          <p className="text-xs text-gray-500">{account.customer.phoneNumber}</p>
        )}
      </div>
    ),
  },
  {
    key: 'verification',
    header: 'Verification',
    render: (account) =>
      account.verification ? (
        <VerificationBadge type={account.verification.type} status={account.verification.status} />
      ) : (
        <span className="text-xs text-gray-400">—</span>
      ),
  },
  {
    key: 'rm',
    header: 'RM',
    render: (account) => <span className="text-sm">{account.rm?.staffName || '—'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    render: (account) => <StatusBadge status={account.status} />,
  },
  {
    key: 'createdAt',
    header: 'Submitted',
    render: (account) => (
      <span className="text-sm text-gray-600">
        {new Date(account.createdAt).toLocaleDateString()}
      </span>
    ),
  },
];

export function ComplianceAccountsList() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'rejected'>('all');
  const { data: accounts, isLoading } = useComplianceAccounts(undefined);

  const accountsArray = Array.isArray(accounts) ? accounts : [];

  const PENDING_STATUSES  = new Set(['PENDING', 'PROCESSING', 'SUBMITTED']);
  const REVIEWED_STATUSES = new Set(['REVIEWED', 'COMPLETED', 'COMPLETED_REVIEW']);
  const REJECTED_STATUSES = new Set(['REJECTED', 'NON_COMPLIANT', 'LIEN_PLACED']);

  const displayAccounts = filter === 'all'
    ? accountsArray
    : filter === 'pending'
    ? accountsArray.filter(a => PENDING_STATUSES.has(a.status))
    : filter === 'reviewed'
    ? accountsArray.filter(a => REVIEWED_STATUSES.has(a.status))
    : accountsArray.filter(a => REJECTED_STATUSES.has(a.status));

  const counts = {
    all:      accountsArray.length,
    pending:  accountsArray.filter(a => PENDING_STATUSES.has(a.status)).length,
    reviewed: accountsArray.filter(a => REVIEWED_STATUSES.has(a.status)).length,
    rejected: accountsArray.filter(a => REJECTED_STATUSES.has(a.status)).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {([
          { key: 'all',      label: 'All' },
          { key: 'pending',  label: 'Pending' },
          { key: 'reviewed', label: 'Reviewed' },
          { key: 'rejected', label: 'Rejected' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-[#920793] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {tab.label}
            <span className={cn(
              'ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full',
              filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'
            )}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      <DataView
        data={displayAccounts}
        columns={columns}
        renderCard={(account) => <AccountCard account={account} />}
        keyExtractor={(account) => account.id}
        title="Compliance Reviews"
        emptyMessage="No compliance reviews found."
        isLoading={isLoading}
        onRowClick={(account) => router.push(`/workflow/compliance/${account.id}`)}
      />
    </div>
  );
}