'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, Building,
  Phone, Mail, FileText, CreditCard, Shield, User,
  Calendar, AlertTriangle,
} from 'lucide-react';
import { PermissionGate } from '@/src/components/ui/PermissionGate';
import { useReferencesByAccountId, usePassReference, useFailReference } from '../hooks/useReferences';
import { formatAccountNumber, formatPhoneNumber } from '../utils/reference-validation';
import { cn } from '@/src/utils';
import type { ReferenceRecord } from '../types/references.types';

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  PENDING:      { label: 'Pending Review', icon: Clock,       color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  PASSED:       { label: 'Approved',       icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  FAILED:       { label: 'Rejected',       icon: XCircle,     color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
  UNDER_REVIEW: { label: 'Under Review',   icon: Clock,       color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
};
const DEFAULT_STATUS = { label: 'Unknown', icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' };

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? DEFAULT_STATUS;
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value ?? '—'}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <p className="text-[14px] font-bold text-gray-900">{title}</p>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

// ── Individual referee card ───────────────────────────────────────────────────

function RefereeSection({ reference }: { reference: ReferenceRecord }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const passMutation = usePassReference();
  const failMutation = useFailReference();
  const isPending = reference.status === 'PENDING';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
            <User className="h-4 w-4 text-[#920793]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-gray-900">{reference.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Building className="h-3 w-3 text-gray-400" />
              <p className="text-[12px] text-gray-500">{reference.bankName}</p>
            </div>
          </div>
        </div>
        <StatusBadge status={reference.status} />
      </div>

      {/* Compact details */}
      <div className="px-4 py-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
          <CreditCard className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="font-mono">{formatAccountNumber(reference.accountNumber)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
          <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span>{formatPhoneNumber(reference.phoneNumber)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-600">
          <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="truncate">{reference.email}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] text-gray-400">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{new Date(reference.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        </div>
        {reference.documentUrl && (
          <a href={reference.documentUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#920793] hover:underline">
            <FileText className="h-3.5 w-3.5 shrink-0" /> View Document
          </a>
        )}
      </div>

      {reference.rejectionReason && (
        <div className="mx-5 mb-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2.5 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-red-700">Rejection Reason</p>
            <p className="text-[12px] text-red-600 mt-0.5">{reference.rejectionReason}</p>
          </div>
        </div>
      )}

      {isPending && (
        <PermissionGate permission="CAN_REVIEW_WORKFLOW">
          <div className="px-5 pb-4 pt-2 border-t border-gray-50">
            {!showRejectForm ? (
              <div className="flex gap-2">
                <button
                  onClick={() => passMutation.mutate(reference.id)}
                  disabled={passMutation.isPending}
                  className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  {passMutation.isPending ? 'Approving…' : 'Approve'}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> Reject
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-[12px] font-semibold text-red-800">Rejection Reason <span className="text-red-500">*</span></p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this reference is being rejected…"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-[13px] border border-red-200 bg-white focus:border-red-400 outline-none resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => failMutation.mutate(
                      { referenceId: reference.id, payload: { reason } },
                      { onSuccess: () => { setShowRejectForm(false); setReason(''); } }
                    )}
                    disabled={!reason.trim() || failMutation.isPending}
                    className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {failMutation.isPending ? 'Rejecting…' : 'Confirm Rejection'}
                  </button>
                  <button
                    onClick={() => { setShowRejectForm(false); setReason(''); }}
                    className="flex-1 h-9 rounded-xl text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </PermissionGate>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Tab = 'referees' | 'account' | 'customer';
type Props = { accountId: string };

export function ReferenceAccountDetail({ accountId }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('referees');
  const { data: references = [], isLoading } = useReferencesByAccountId(accountId);

  const first = references[0];
  const req = first?.accountRequest;
  const cust = first?.customer;
  const customerName = cust
    ? [cust.firstName, cust.middleName, cust.lastName].filter(Boolean).join(' ')
    : 'Account Request';
  const accountType = req ? `${req.accountCategory} ${req.accountType}` : '';
  const initials = customerName.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const pendingCount = references.filter(r => r.status === 'PENDING').length;
  const passedCount = references.filter(r => r.status === 'PASSED').length;
  const failedCount = references.filter(r => r.status === 'FAILED').length;

  const overallStatus = pendingCount > 0 ? 'PENDING' : passedCount === references.length && references.length > 0 ? 'PASSED' : 'FAILED';
  const overallCfg = STATUS_CONFIG[overallStatus] ?? DEFAULT_STATUS;
  const OverallIcon = overallCfg.icon;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'referees', label: `Referees (${references.length})` },
    { key: 'account',  label: 'Account' },
    { key: 'customer', label: 'Customer' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Loading references…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-black text-gray-900">{customerName}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5 capitalize">{accountType.toLowerCase()}</p>
            {req && (
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-[11px] font-mono text-gray-400">{req.requestNumber}</p>
                <span className="text-[11px] text-gray-300">·</span>
                <p className="text-[11px] text-gray-400">RM: {req.rm.staffName}</p>
              </div>
            )}
            {cust && (
              <div className="flex items-center gap-1.5 mt-1">
                <Shield className="h-3 w-3 text-gray-400" />
                <p className="text-[11px] text-gray-400">{cust.verificationType}: {cust.identifierMasked}</p>
              </div>
            )}
          </div>
          <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0', overallCfg.bg, overallCfg.color)}>
            <OverallIcon className="h-3 w-3" />
            {overallCfg.label}
          </span>
        </div>

        {/* Summary counts */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
          <div className="text-center">
            <p className="text-[20px] font-black text-gray-900">{references.length}</p>
            <p className="text-[11px] text-gray-500">Total</p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-black text-amber-600">{pendingCount}</p>
            <p className="text-[11px] text-gray-500">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-black text-green-600">{passedCount}</p>
            <p className="text-[11px] text-gray-500">Approved</p>
          </div>
          {failedCount > 0 && (
            <div className="text-center">
              <p className="text-[20px] font-black text-red-600">{failedCount}</p>
              <p className="text-[11px] text-gray-500">Rejected</p>
            </div>
          )}
        </div>
      </div>

      {/* Status banner */}
      <div className={cn('rounded-2xl border p-4 flex items-start gap-3', overallCfg.bg)}>
        <OverallIcon className={cn('h-5 w-5 shrink-0 mt-0.5', overallCfg.color)} />
        <div>
          <p className={cn('text-[13px] font-bold', overallCfg.color)}>
            {pendingCount > 0
              ? `${pendingCount} reference${pendingCount > 1 ? 's' : ''} awaiting review`
              : passedCount === references.length && references.length > 0
              ? 'All references approved'
              : `${failedCount} reference${failedCount > 1 ? 's' : ''} rejected`}
          </p>
          <p className="text-[12px] text-gray-600 mt-0.5">
            {pendingCount > 0
              ? 'Review each referee and approve or reject as appropriate.'
              : passedCount === references.length && references.length > 0
              ? 'All referees validated. Account opening can proceed.'
              : 'Some references were rejected. A corrective task has been created for the RM.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 py-2 rounded-lg text-[13px] font-medium transition-all',
              tab === t.key ? 'bg-white text-[#920793] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Referees */}
      {tab === 'referees' && (
        references.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-[14px] text-gray-400">No references found for this account.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {references.map(ref => <RefereeSection key={ref.id} reference={ref} />)}
          </div>
        )
      )}

      {/* Tab: Account */}
      {tab === 'account' && (
        req ? (
          <Section title="Account Request">
            <InfoRow label="Request Number" value={<span className="font-mono text-[12px]">{req.requestNumber}</span>} />
            <InfoRow label="Account Type" value={<span className="capitalize">{accountType.toLowerCase()}</span>} />
            <InfoRow label="Tier" value={req.tier?.replace('_', ' ') ?? '—'} />
            <InfoRow label="Status" value={req.status} />
            <InfoRow label="Submitted" value={
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {new Date(req.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            } />
            <InfoRow label="RM" value={
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {req.rm.staffName}
              </span>
            } />
            <InfoRow label="RM Email" value={req.rm.email} />
          </Section>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-[14px] text-gray-400">Account details not available.</p>
          </div>
        )
      )}

      {/* Tab: Customer */}
      {tab === 'customer' && (
        cust ? (
          <Section title="Customer">
            <InfoRow label="Full Name" value={customerName} />
            <InfoRow label="Verification" value={
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-gray-400" />
                {cust.verificationType}: {cust.identifierMasked}
              </span>
            } />
            <InfoRow label="Phone" value={
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />
                {formatPhoneNumber(cust.phoneNumber)}
              </span>
            } />
            <InfoRow label="Email" value={
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />
                {cust.email}
              </span>
            } />
          </Section>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <p className="text-[14px] text-gray-400">Customer details not available.</p>
          </div>
        )
      )}
    </div>
  );
}
