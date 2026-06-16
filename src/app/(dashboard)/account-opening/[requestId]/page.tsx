'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@src/utils';
import { getRequestById, AccountOpeningRequest } from '@src/lib/mock-data';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  INDIVIDUAL_SAVINGS: 'Individual Savings',
  INDIVIDUAL_CURRENT: 'Individual Current',
};

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  TIER_2_PENDING: { label: 'Tier 2 Upgrade Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  TIER_3_PENDING: { label: 'Tier 3 Upgrade Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  PICTURE_UPLOAD_PENDING: { label: 'Picture Upload Pending', icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  MANUAL_REVIEW_REQUIRED: { label: 'Manual Review Required', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' },
  FAILED_VERIFICATION: { label: 'Verification Failed', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  CORRECTION_REQUESTED: { label: 'Correction Requested', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  REFERENCE_FAILED: { label: 'Reference Failed', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  MIDDLEWARE_FAILED: { label: 'Processing Failed', icon: RefreshCw, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  MOBILE_ONBOARDING_PENDING: { label: 'Mobile Onboarding Pending', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  DEPOSIT_FOLLOWUP: { label: 'Deposit Follow-up', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
  ACTIVE: { label: 'Active', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
};

function getContinueRoute(status: string, request: AccountOpeningRequest) {
  switch (status) {
    case 'TIER_2_PENDING':
    case 'TIER_3_PENDING':
      return `/account-upgrade/${request.accountNumber}`;
    case 'PICTURE_UPLOAD_PENDING':
    case 'REFERENCE_FAILED':
      return request.accountType === 'INDIVIDUAL_CURRENT'
        ? '/account-opening/individual-current'
        : '/account-opening/individual-savings';
    default:
      return null;
  }
}

export default function AccountOpeningDetailPage({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = React.use(params);
  const router = useRouter();
  const request = getRequestById(requestId);

  if (!request) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Request not found.</p>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[request.status] ?? STATUS_CONFIG['ACTIVE'];
  const StatusIcon = statusConfig.icon;
  const continueRoute = getContinueRoute(request.status, request);
  const initials = request.customerName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: '#920793' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-black text-gray-900">{request.customerName}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {ACCOUNT_TYPE_LABELS[request.accountType] ?? request.accountType}
              {request.accountNumber && ` · ${request.accountNumber}`}
            </p>
            <p className="text-[11px] font-mono text-gray-400 mt-1">{request.id}</p>
          </div>
          <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full', request.tier === 3 ? 'bg-purple-50 text-[#920793]' : request.tier === 2 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500')}>
            Tier {request.tier}
          </span>
        </div>
      </div>

      {/* Status banner */}
      <div className={cn('rounded-2xl border p-4 flex items-start gap-3', statusConfig.bg)}>
        <StatusIcon className={cn('h-5 w-5 shrink-0 mt-0.5', statusConfig.color)} />
        <div>
          <p className={cn('text-[13px] font-bold', statusConfig.color)}>{statusConfig.label}</p>
          <p className="text-[12px] text-gray-600 mt-0.5">{request.pendingAction}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-[14px] font-bold text-gray-900">Request Timeline</p>
        </div>
        <div className="px-5 py-1">
          {[
            ['Request ID', request.id],
            ['Date Created', new Date(request.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
            ['Last Updated', new Date(request.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })],
            ['Current Tier', `Tier ${request.tier}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <span className="text-[12px] text-gray-500 font-medium">{label}</span>
              <span className="text-[13px] font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {continueRoute ? (
        <button
          onClick={() => router.push(continueRoute)}
          className="w-full h-11 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#920793' }}
        >
          Continue Account Opening
          <ArrowRight className="h-4 w-4" />
        </button>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-[13px] text-gray-500">
            This request is pending review by Operations. No action required from you at this time.
          </p>
        </div>
      )}
    </div>
  );
}
