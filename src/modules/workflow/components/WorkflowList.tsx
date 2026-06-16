'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';
import { MOCK_WORKFLOW_REVIEWS } from '@src/lib/mock-data';
import { WorkflowReview, WorkflowReviewStatus, WorkflowReviewType } from '../types/workflow.types';
import { cn } from '@src/utils';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { ACCOUNT_TYPE_LABELS, WORKFLOW_STATUS_STYLES } from '@src/constants/labels';

const STATUS_STYLES = WORKFLOW_STATUS_STYLES;

const TYPE_LABELS: Record<WorkflowReviewType, string> = {
  ACCOUNT_OPENING:     'Account Opening',
  TIER_UPGRADE:        'Tier Upgrade',
  MANUAL_VERIFICATION: 'Manual Verification',
  LIEN_REQUEST:        'Lien Request',
  CORRECTION:          'Correction',
};



function StatusBadge({ status }: { status: WorkflowReviewStatus }) {
  const s = STATUS_STYLES[status];
  return <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full', s.cls)}>{s.label}</span>;
}

const STATUS_FILTER_OPTIONS: { value: WorkflowReviewStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'All' },
  { value: 'PENDING',  label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function WorkflowList() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkflowReviewStatus | 'ALL'>('ALL');

  const filtered = MOCK_WORKFLOW_REVIEWS.filter((r) => {
    const matchesSearch = !search ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.requestId.toLowerCase().includes(search.toLowerCase()) ||
      (r.accountNumber ?? '').includes(search);
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = MOCK_WORKFLOW_REVIEWS.filter((r) => r.status === 'PENDING').length;

  const columns: ColumnDef<WorkflowReview>[] = [
    {
      key: 'customer', header: 'Customer',
      render: (r) => {
        const initials = r.customerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>{initials}</div>
            <span className="font-medium text-gray-900 whitespace-nowrap">{r.customerName}</span>
          </div>
        );
      },
    },
    { key: 'type',    header: 'Review Type',  render: (r) => <span className="text-gray-500 whitespace-nowrap">{TYPE_LABELS[r.reviewType]}</span> },
    { key: 'account', header: 'Account Type', render: (r) => <span className="text-gray-500 whitespace-nowrap">{ACCOUNT_TYPE_LABELS[r.accountType] ?? r.accountType}</span> },
    { key: 'by',      header: 'Submitted By', render: (r) => <span className="text-gray-600 whitespace-nowrap">{r.submittedBy}</span> },
    { key: 'status',  header: 'Status',       render: (r) => <StatusBadge status={r.status} /> },
    { key: 'updated', header: 'Last Updated', render: (r) => <span className="text-gray-400 text-[13px] whitespace-nowrap">{new Date(r.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
    {
      key: 'action', header: '',
      render: (r) => (
        <button onClick={() => router.push(`/workflow/reviews/${r.id}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap">
          Review <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  function renderCard(r: WorkflowReview) {
    const initials = r.customerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <button onClick={() => router.push(`/workflow/reviews/${r.id}`)}
        className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3 hover:shadow-md transition-shadow active:scale-[0.98] text-left">
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-gray-900">{r.customerName}</p>
            <StatusBadge status={r.status} />
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">{TYPE_LABELS[r.reviewType]} · {ACCOUNT_TYPE_LABELS[r.accountType] ?? r.accountType}</p>
          <p className="text-[11px] text-gray-400 mt-1">By {r.submittedBy} · {new Date(r.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0 mt-1" />
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">Workflow Reviews</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">{pendingCount} pending {pendingCount === 1 ? 'review' : 'reviews'} requiring action</p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button key={opt.value} onClick={() => setStatusFilter(opt.value)}
            className={cn('px-3 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors',
              statusFilter === opt.value ? 'bg-[#920793] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#920793] hover:text-[#920793]')}>
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name or request ID..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent" />
      </div>

      <DataView
        data={filtered} columns={columns} renderCard={renderCard}
        keyExtractor={(r) => r.id}
        title={`${filtered.length} ${filtered.length === 1 ? 'Review' : 'Reviews'}`}
        emptyMessage="No reviews found."
        gridCols="grid-cols-1 sm:grid-cols-2"
      />
    </div>
  );
}
