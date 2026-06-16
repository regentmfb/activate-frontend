'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Lock, Clock, User, FileText } from 'lucide-react';
import { getWorkflowReviewById } from '@src/lib/mock-data';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { useApproveManual, useRejectManual } from '@src/modules/identity/hooks/useIdentityVerification';
import { appToast } from '@src/lib/toast';
import { WorkflowReviewStatus, WorkflowReviewType } from '../types/workflow.types';
import { cn } from '@src/utils';

const STATUS_CONFIG: Record<WorkflowReviewStatus, { label: string; cls: string; bg: string; icon: React.ElementType }> = {
  PENDING:       { label: 'Pending Review', cls: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   icon: Clock },
  APPROVED:      { label: 'Approved',       cls: 'text-green-600',  bg: 'bg-green-50 border-green-200',   icon: CheckCircle2 },
  REJECTED:      { label: 'Rejected',       cls: 'text-red-600',    bg: 'bg-red-50 border-red-200',       icon: XCircle },
  MANUAL_REVIEW: { label: 'Manual Review',  cls: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',     icon: FileText },
  LIEN_PLACED:   { label: 'Lien Placed',    cls: 'text-[#920793]',  bg: 'bg-purple-50 border-purple-200', icon: Lock },
};

const TYPE_LABELS: Record<WorkflowReviewType, string> = {
  ACCOUNT_OPENING:     'Account Opening',
  TIER_UPGRADE:        'Tier Upgrade',
  MANUAL_VERIFICATION: 'Manual Verification',
  LIEN_REQUEST:        'Lien Request',
  CORRECTION:          'Correction',
};

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_SAVINGS: 'Individual Savings',
  INDIVIDUAL_CURRENT: 'Individual Current',
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

type Props = { id: string };

export function WorkflowDetail({ id }: Props) {
  const router = useRouter();
  const { requirePin } = usePinVerification();
  const review = getWorkflowReviewById(id);
  const [currentStatus, setCurrentStatus] = useState<WorkflowReviewStatus>(review?.status ?? 'PENDING');
  const [note, setNote] = useState('');
  const [actionDone, setActionDone] = useState(false);

  const { mutate: approveManual, isPending: isApproving } = useApproveManual();
  const { mutate: rejectManual, isPending: isRejecting } = useRejectManual();

  if (!review) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Review not found.</p>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[currentStatus];
  const StatusIcon = config.icon;
  const isPending = currentStatus === 'PENDING' && !actionDone;
  const initials = review.customerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  function handleApprove() {
    if (!review) return;
    requirePin('APPROVE_WORKFLOW', () => {
      if (review.reviewType === 'MANUAL_VERIFICATION') {
        approveManual(review.requestId, {
          onSuccess: () => {
            setCurrentStatus('APPROVED');
            setActionDone(true);
          },
        });
      } else {
        setCurrentStatus('APPROVED');
        setActionDone(true);
      }
    });
  }

  function handleReject() {
    if (!review) return;
    requirePin('REJECT_WORKFLOW', () => {
      if (review.reviewType === 'MANUAL_VERIFICATION') {
        if (!note.trim()) {
          appToast.error('Please enter a note as the rejection reason');
          return;
        }
        rejectManual(
          { id: review.requestId, payload: { reason: note } },
          {
            onSuccess: () => {
              setCurrentStatus('REJECTED');
              setActionDone(true);
            },
          }
        );
      } else {
        setCurrentStatus('REJECTED');
        setActionDone(true);
      }
    });
  }

  function handlePlaceLien() {
    requirePin('PLACE_LIEN', () => { setCurrentStatus('LIEN_PLACED'); setActionDone(true); });
  }

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-black text-gray-900">{review.customerName}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {TYPE_LABELS[review.reviewType]} · {ACCOUNT_TYPE_LABELS[review.accountType] ?? review.accountType}
              {review.accountNumber && ` · ${review.accountNumber}`}
            </p>
            <p className="text-[11px] font-mono text-gray-400 mt-1">{review.requestId}</p>
          </div>
          <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0', config.cls, config.bg.split(' ')[0])}>
            {config.label}
          </span>
        </div>
      </div>

      {/* Status banner */}
      <div className={cn('rounded-2xl border p-4 flex items-center gap-3', config.bg)}>
        <StatusIcon className={cn('h-5 w-5 shrink-0', config.cls)} />
        <div>
          <p className={cn('text-[13px] font-bold', config.cls)}>{config.label}</p>
          {actionDone && (
            <p className="text-[12px] text-gray-600 mt-0.5">
              {currentStatus === 'APPROVED' && 'This request has been approved. The RM has been notified.'}
              {currentStatus === 'REJECTED' && 'This request has been rejected. The RM has been notified.'}
              {currentStatus === 'LIEN_PLACED' && 'A lien has been placed on this account.'}
            </p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-[14px] font-bold text-gray-900">Review Details</p>
        </div>
        <div className="px-5 py-1">
          <InfoRow label="Request ID" value={<span className="font-mono text-[12px]">{review.requestId}</span>} />
          <InfoRow label="Review Type" value={TYPE_LABELS[review.reviewType]} />
          <InfoRow label="Account Type" value={ACCOUNT_TYPE_LABELS[review.accountType] ?? review.accountType} />
          {review.accountNumber && <InfoRow label="Account Number" value={review.accountNumber} />}
          <InfoRow label="Submitted By" value={
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-gray-400" />
              {review.submittedBy} ({review.submittedByRole})
            </span>
          } />
          <InfoRow label="Date Submitted" value={new Date(review.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <InfoRow label="Last Updated" value={new Date(review.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })} />
          {review.reviewerNote && <InfoRow label="Reviewer Note" value={review.reviewerNote} />}
        </div>
      </div>

      {/* Reviewer note — only when pending */}
      {isPending && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <p className="text-[14px] font-bold text-gray-900">Add Note</p>
            <p className="text-[12px] text-gray-500 mt-0.5">Optional — visible to the submitting RM.</p>
          </div>
          <div className="p-5">
            <textarea value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Enter your review note here..."
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] text-gray-800 bg-gray-50 border border-gray-200 outline-none focus:border-[#920793] transition-colors resize-none placeholder:text-gray-300" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      {isPending && (
        <div className="space-y-2.5">
          <button onClick={handleApprove} disabled={isApproving || isRejecting}
            className="w-full h-11 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity bg-green-600 disabled:opacity-40">
            <CheckCircle2 className="h-4 w-4" /> Approve (PIN required)
          </button>
          <div className={cn('grid gap-2.5', review.reviewType === 'LIEN_REQUEST' ? 'grid-cols-2' : 'grid-cols-1')}>
            <button onClick={handleReject} disabled={isApproving || isRejecting}
              className="h-11 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity bg-red-500 disabled:opacity-40">
              <XCircle className="h-4 w-4" /> Reject (PIN required)
            </button>
            {review.reviewType === 'LIEN_REQUEST' && (
              <button onClick={handlePlaceLien} disabled={isApproving || isRejecting}
                className="h-11 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40"
                style={{ backgroundColor: '#920793' }}>
                <Lock className="h-4 w-4" /> Place Lien
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
