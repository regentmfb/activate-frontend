'use client';

import { useState } from 'react';
import {
  Shield,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  X,
  FileText,
  User,
  Activity,
  Search,
} from 'lucide-react';
import { useLienRequests, useReviewLienRequest, usePlaceLienFromRequest } from '../hooks/useLien';
import { usePermissions } from '@src/hooks/usePermissions';
import { Button } from '@src/components/ui/button';
import { Badge } from '@src/components/ui/badge';
import type { LienRequest, LienRequestStatus } from '../types/lien.types';
import { cn } from '@src/utils';
import { DataView, ColumnDef } from '@src/components/ui/DataView';

const STATUS_CONFIG: Record<LienRequestStatus, { label: string; cls: string; icon: React.ElementType }> = {
  PENDING_TEAM_LEAD: { label: 'Awaiting Team Lead', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  PENDING_TEAM_LEAD_REVIEW: { label: 'Awaiting Team Lead', cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  PENDING_CMO:       { label: 'Awaiting CMO',        cls: 'bg-blue-50 text-blue-700 border-blue-200',   icon: Clock },
  PENDING_CMO_REVIEW:       { label: 'Awaiting CMO',        cls: 'bg-blue-50 text-blue-700 border-blue-200',   icon: Clock },
  PENDING_OPERATIONS:{ label: 'Awaiting Operations', cls: 'bg-purple-50 text-[#920793] border-purple-200', icon: Clock },
  PLACED:            { label: 'Lien Placed',         cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  APPROVED:          { label: 'Lien Placed',         cls: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
  REJECTED:          { label: 'Rejected',            cls: 'bg-red-50 text-red-700 border-red-200',       icon: XCircle },
};

function StatusBadge({ status }: { status: LienRequestStatus }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertCircle };
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className={cn('flex items-center gap-1 text-[11px]', cfg.cls)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function ReviewModal({
  request,
  actionLabel,
  onConfirm,
  onClose,
  isPending,
  initialAction = 'APPROVE',
}: {
  request: LienRequest;
  actionLabel: string;
  onConfirm: (action: 'APPROVE' | 'REJECT', comment: string) => void;
  onClose: () => void;
  isPending: boolean;
  initialAction?: 'APPROVE' | 'REJECT';
}) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>(initialAction);
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md space-y-4 p-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
            <Shield className="h-4 w-4 text-[#920793]" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-gray-900">
              {action === 'APPROVE' ? 'Approve Lien Request' : 'Reject Lien Request'}
            </p>
            <p className="text-[12px] text-gray-500">{request.accountNumber} · ₦{request.amount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 space-y-1">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Reason stated by RM</p>
          <p className="text-[13px] text-gray-700">{request.reason}</p>
        </div>

        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
            {action === 'REJECT' ? 'Rejection Reason (required)' : 'Comment (optional)'}
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={action === 'REJECT' ? 'State the reason for rejection…' : 'Add a comment…'}
            className="w-full px-3 py-2 rounded-lg text-[13px] text-gray-800 bg-gray-50 border border-gray-200 focus:border-[#920793] outline-none resize-none"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className={cn('flex-1 text-white', action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700')}
            onClick={() => onConfirm(action, comment)}
            disabled={isPending || (action === 'REJECT' && !comment.trim())}
          >
            {isPending ? 'Processing…' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function LienRequestDetailsModal({
  request,
  onClose,
  canReview,
  canPlace,
  onReview,
  onPlace,
  isPlacing,
}: {
  request: LienRequest;
  onClose: () => void;
  canReview: boolean;
  canPlace: boolean;
  onReview: (action: 'APPROVE' | 'REJECT') => void;
  onPlace: () => void;
  isPlacing: boolean;
}) {
  const customer = request.customerDetails;
  const account = request.accountDetails;
  const history = request.reviewHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-[#920793]" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-gray-900">Lien Request Details</h3>
              <p className="text-[12px] text-gray-400">ID: {request.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status and Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-purple-50/30 border border-purple-100/50 rounded-2xl p-4">
            <div>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block font-bold">Status</span>
              <div className="mt-1">
                <StatusBadge status={request.status} />
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block font-bold">Amount Requested</span>
              <p className="text-[16px] font-black text-[#920793] mt-0.5 font-bold">₦{request.amount.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider block font-bold">Submitted Date</span>
              <p className="text-[13px] font-bold text-gray-700 mt-0.5">
                {new Date(request.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Details */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                <User className="h-4 w-4 text-[#920793]" /> Customer Information
              </h4>
              <div className="space-y-3 text-[12px]">
                <div>
                  <span className="text-gray-400">Full Name</span>
                  <p className="font-semibold text-gray-900">{request.customerName || 'N/A'}</p>
                </div>
                {customer && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">BVN</span>
                        <p className="font-mono font-semibold text-gray-900">{customer.bvnMasked || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">NIN</span>
                        <p className="font-mono font-semibold text-gray-900">{customer.ninMasked || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Phone Number</span>
                        <p className="font-semibold text-gray-900">{customer.phoneNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Email Address</span>
                        <p className="font-semibold text-gray-900 truncate" title={customer.email || ''}>
                          {customer.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-400">Gender</span>
                        <p className="font-semibold text-gray-900 capitalize">{customer.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Date of Birth</span>
                        <p className="font-semibold text-gray-900">
                          {customer.dateOfBirth
                            ? new Date(customer.dateOfBirth).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Address</span>
                      <p className="font-semibold text-gray-900 leading-relaxed">{customer.address || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Account & Reason Info */}
            <div className="space-y-4">
              <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                <FileText className="h-4 w-4 text-[#920793]" /> Account & Request Details
              </h4>
              <div className="space-y-3 text-[12px]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400">Account Number</span>
                    <p className="font-mono font-bold text-gray-900">{request.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Category</span>
                    <p className="font-semibold text-gray-900 uppercase">{account?.accountCategory || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Request Type Reference</span>
                  <p className="font-mono text-gray-900">{account?.requestNumber || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Submitted By</span>
                  <p className="font-semibold text-gray-900">
                    {request.submittedBy} <span className="text-gray-400">({request.submittedByRole})</span>
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                    Hold Reason
                  </span>
                  <p className="text-gray-700 leading-relaxed">{request.reason}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          {request.supportingDocuments && request.supportingDocuments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                Supporting Documents
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {request.supportingDocuments.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/10 transition-all text-[12px] font-semibold text-gray-700"
                  >
                    <FileText className="h-4 w-4 text-purple-500 shrink-0" />
                    <span className="truncate flex-1">{doc.fileName}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Review History / Timeline */}
          <div className="space-y-4">
            <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <Activity className="h-4 w-4 text-[#920793]" /> Approval Timeline & History
            </h4>
            {history.length === 0 ? (
              <div className="bg-gray-50/50 rounded-xl p-4 text-center border border-dashed border-gray-200">
                <p className="text-[12px] text-gray-400">No review actions recorded yet. Awaiting initial approval.</p>
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6 ml-2 pt-1">
                {history.map((hist, idx) => {
                  const isApprove = hist.action === 'APPROVE';
                  const isReject = hist.action === 'REJECT';
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span
                        className={cn(
                          'absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border bg-white ring-4 ring-white',
                          isApprove ? 'border-green-500 text-green-500' : isReject ? 'border-red-500 text-red-500' : 'border-blue-500 text-blue-500'
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', isApprove ? 'bg-green-500' : isReject ? 'bg-red-500' : 'bg-blue-500')} />
                      </span>
                      
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-[12px] font-bold text-gray-900">
                            {hist.reviewerName} <span className="text-[11px] text-gray-400 font-normal">({hist.reviewerRole})</span>
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(hist.timestamp).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'text-[10px] font-bold px-1.5 py-0.5 rounded',
                              isApprove ? 'bg-green-50 text-green-700' : isReject ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                            )}
                          >
                            {hist.action}
                          </span>
                        </div>
                        {hist.comments && (
                          <p className="text-[12px] text-gray-600 bg-gray-50 rounded-lg p-2.5 mt-1 leading-relaxed border border-gray-100">
                            {hist.comments}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer (Actions) */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {request.status === 'PENDING_OPERATIONS' ? (
            canPlace && (
              <>
                <Button
                  onClick={() => onReview('REJECT')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
                <Button
                  onClick={onPlace}
                  disabled={isPlacing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isPlacing ? 'Placing…' : 'Place Lien'}
                </Button>
              </>
            )
          ) : (
            canReview && (
              <>
                <Button
                  onClick={() => onReview('REJECT')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => onReview('APPROVE')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Approve
                </Button>
              </>
            )
          )}
        </div>

      </div>
    </div>
  );
}

type Props = {
  title?: string;
};

export function LienRequestsView({ title = 'Lien Requests' }: Props) {
  const [page, setPage] = useState(1);
  const [reviewTarget, setReviewTarget] = useState<LienRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<LienRequest | null>(null);
  const [search, setSearch] = useState('');
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const limit = 10;

  const { role, can } = usePermissions();
  const isTeamLead     = role === 'TEAM_LEAD';
  const isCmo          = role === 'CMO';
  const isOperations   = role === 'OPERATIONS' || role === 'INTERNAL_CONTROL';
  const isSuperAdmin   = role === 'SUPER_ADMIN';
  const isRm           = role === 'RM' || role === 'ACCOUNT_OFFICER';

  const { data, isLoading } = useLienRequests(page, limit);
  console.log('[LienRequestsView] data:', data, 'isLoading:', isLoading);
  const { mutate: reviewRequest, isPending: isReviewing } = useReviewLienRequest();
  const { mutate: placeLien, isPending: isPlacing } = usePlaceLienFromRequest();

  const requests = data?.requests ?? [];
  const pagination = data?.pagination;

  const filteredRequests = requests.filter((req) => {
    const q = search.toLowerCase();
    return (
      req.accountNumber.toLowerCase().includes(q) ||
      (req.customerName && req.customerName.toLowerCase().includes(q)) ||
      req.reason.toLowerCase().includes(q) ||
      req.submittedBy.toLowerCase().includes(q)
    );
  });

  function canReview(req: LienRequest): boolean {
    if (req.status === 'APPROVED' || req.status === 'REJECTED') return false;
    if (isSuperAdmin) return true;
    if (isTeamLead && (req.status === 'PENDING_TEAM_LEAD' || req.status === 'PENDING_TEAM_LEAD_REVIEW')) return true;
    if (isCmo && (req.status === 'PENDING_CMO' || req.status === 'PENDING_CMO_REVIEW')) return true;
    return false;
  }

  function canPlace(req: LienRequest): boolean {
    return (isOperations || isSuperAdmin) && req.status === 'PENDING_OPERATIONS';
  }

  function getActionLabel(): string {
    if (isTeamLead) return 'Review Lien Request';
    if (isCmo) return 'CMO Review — Forward to Operations';
    return 'Review Lien Request';
  }

  function handleReviewConfirm(action: 'APPROVE' | 'REJECT', comment: string) {
    if (!reviewTarget) return;
    reviewRequest(
      { id: reviewTarget.id, payload: { action, comments: comment, rejectionReason: action === 'REJECT' ? comment : undefined } },
      { onSuccess: () => setReviewTarget(null), onError: () => setReviewTarget(null) }
    );
  }

  const columns: ColumnDef<LienRequest>[] = [
    {
      key: 'account',
      header: 'Account & Customer',
      render: (req) => (
        <div onClick={() => setSelectedRequest(req)} className="cursor-pointer">
          <p className="font-mono text-[13px] font-semibold text-gray-900">{req.accountNumber}</p>
          {req.customerName && <p className="text-[11px] text-gray-400">{req.customerName}</p>}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (req) => (
        <p onClick={() => setSelectedRequest(req)} className="font-semibold text-gray-900 cursor-pointer">
          ₦{req.amount.toLocaleString()}
        </p>
      ),
    },
    {
      key: 'submittedBy',
      header: 'Requested By',
      render: (req) => (
        <div onClick={() => setSelectedRequest(req)} className="cursor-pointer">
          <p className="font-semibold text-gray-900">{req.submittedBy}</p>
          <p className="text-[11px] text-gray-400">{req.submittedByRole}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (req) => (
        <p onClick={() => setSelectedRequest(req)} className="text-gray-700 truncate max-w-[200px] cursor-pointer" title={req.reason}>
          {req.reason}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (req) => (
        <div onClick={() => setSelectedRequest(req)} className="cursor-pointer">
          <StatusBadge status={req.status} />
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (req) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedRequest(req)}
            className="text-[12px] h-8 text-[#920793] bg-purple-50 hover:bg-purple-100 border-transparent hover:border-transparent font-semibold"
          >
            View Details
          </Button>
        </div>
      ),
    },
  ];

  const renderCard = (req: LienRequest) => (
    <div
      onClick={() => setSelectedRequest(req)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all duration-200 h-full flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Shield className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="font-mono text-[13px] font-semibold text-gray-900">{req.accountNumber}</p>
              {req.customerName && <p className="text-[11px] text-gray-400">{req.customerName}</p>}
            </div>
          </div>
          <StatusBadge status={req.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <div>
            <span className="text-gray-400">Amount</span>
            <p className="font-semibold text-gray-900">₦{req.amount.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-400">Requested by</span>
            <p className="font-semibold text-gray-900">{req.submittedBy}</p>
          </div>
        </div>

        <div className="text-[12px]">
          <span className="text-gray-400">Reason: </span>
          <span className="text-gray-700">{req.reason}</span>
        </div>

        {req.rejectionReason && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
            <p className="text-[12px] text-red-700"><span className="font-semibold">Rejected:</span> {req.rejectionReason}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-50 mt-auto">
        <span className="text-[12px] font-semibold text-[#920793] flex items-center gap-1">
          View details <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
                <Shield className="h-4 w-4 text-[#920793]" />
              </div>
              <p className="text-2xl font-black text-gray-900">{pagination?.total ?? requests.length}</p>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">Total Requests</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {requests.filter(r => r.status.includes('PENDING') || r.status.includes('REVIEW')).length}
              </p>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">Pending Action</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {requests.filter(r => r.status === 'APPROVED' || r.status === 'PLACED').length}
              </p>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">Holds Placed</p>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center mb-2">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">
                {requests.filter(r => r.status === 'REJECTED').length}
              </p>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">Rejected Requests</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by account number, customer name, or reason..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent"
          />
        </div>

        <DataView
          data={filteredRequests}
          columns={columns}
          renderCard={renderCard}
          keyExtractor={(req) => req.id}
          title={`${filteredRequests.length} ${filteredRequests.length === 1 ? 'Lien Request' : 'Lien Requests'}`}
          emptyMessage="No lien requests found."
          gridCols="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          isLoading={isLoading}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-100">
            <p className="text-[12px] text-gray-600">
              Showing {filteredRequests.length} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-[12px] text-gray-600 px-2">Page {page} of {pagination.totalPages}</span>
              <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          request={reviewTarget}
          actionLabel={getActionLabel()}
          initialAction={reviewAction}
          onConfirm={handleReviewConfirm}
          onClose={() => setReviewTarget(null)}
          isPending={isReviewing}
        />
      )}

      {selectedRequest && (
        <LienRequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          canReview={canReview(selectedRequest)}
          canPlace={canPlace(selectedRequest)}
          onReview={(action) => {
            setReviewAction(action);
            setReviewTarget(selectedRequest);
            setSelectedRequest(null);
          }}
          onPlace={() => {
            placeLien(selectedRequest.id);
            setSelectedRequest(null);
          }}
          isPlacing={isPlacing}
        />
      )}
    </>
  );
}
