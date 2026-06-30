'use client';

import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FileText, ArrowRight, Trash2, PiggyBank, CreditCard } from 'lucide-react';
import { useGetDrafts, useDeleteDraft, ActivateDraft } from '@src/modules/drafts/api/drafts.api';
import { Button } from '@src/components/ui/button';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { Spinner } from '@src/components/ui/spinner';
import { cn } from '@src/utils';

export default function DraftsPage() {
  const router = useRouter();
  const { data: allDrafts = [], isLoading } = useGetDrafts();
  
  // Deduplicate by clientReference (keeping the most recent) and filter out COMPLETE
  const drafts = allDrafts
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .filter((d, index, self) => {
      if (d.draftData?.step === 'COMPLETE') return false;
      const ref = d.draftData?.state?.clientReference;
      if (!ref) return true; // Keep it if there's no reference yet
      // Keep only the first occurrence of this reference in the sorted array
      return index === self.findIndex(t => t.draftData?.state?.clientReference === ref);
    });
  const { mutate: deleteDraft, isPending: isDeleting } = useDeleteDraft();

  function getDraftDetails(draft: ActivateDraft) {
    const isSavings = draft.accountType === 'SAVINGS';
    return {
      title: isSavings ? 'Individual Savings' : 'Individual Current',
      icon: isSavings ? PiggyBank : CreditCard,
      color: isSavings ? 'text-[#920793]' : 'text-blue-600',
      bg: isSavings ? 'bg-purple-100' : 'bg-blue-100',
      href: isSavings ? `/account-opening/individual-savings?draftId=${draft.id}` : `/account-opening/individual-current?draftId=${draft.id}`,
    };
  }

  const STEP_LABELS: Record<string, string> = {
    IDENTITY_INPUT: 'Identity Input',
    OTP_VERIFICATION: 'OTP Verification',
    FACE_PROCESSING: 'Face Processing',
    BIODATA_CONFIRMATION: 'Biodata Confirmation',
    LIVENESS_CHECK: 'Liveness Check',
    PHOTO_CAPTURE: 'Photo Capture',
    REFERENCE_UPLOAD: 'Reference Upload',
    TIER1_SUCCESS: 'Tier 1 Complete',
    TIER2_UPGRADE: 'Tier 2 Upgrade',
    TIER2_SUCCESS: 'Tier 2 Complete',
    TIER3_UPGRADE: 'Tier 3 Upgrade',
    TIER3_SUCCESS: 'Tier 3 Complete',
    COMPLETE: 'Complete',
  };

  const PROGRESS_ORDER = [
    'IDENTITY_INPUT',
    'OTP_VERIFICATION',
    'FACE_PROCESSING',
    'BIODATA_CONFIRMATION',
    'LIVENESS_CHECK',
    'PHOTO_CAPTURE',
    'REFERENCE_UPLOAD',
    'TIER1_SUCCESS',
    'TIER2_UPGRADE',
    'TIER2_SUCCESS',
    'TIER3_UPGRADE',
    'TIER3_SUCCESS',
    'COMPLETE'
  ];

  function getProgressPercentage(step: string) {
    const index = PROGRESS_ORDER.indexOf(step);
    if (index === -1) return 10;
    const maxIndex = PROGRESS_ORDER.indexOf('TIER1_SUCCESS'); // Consider Tier 1 as 100% of base account opening
    if (index >= maxIndex) return 100;
    return Math.max(5, Math.round((index / maxIndex) * 100));
  }

  const columns: ColumnDef<ActivateDraft>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (draft) => {
        const details = getDraftDetails(draft);
        const state = draft.draftData.state || {};
        const firstName = state.firstName || state.biodata?.firstName;
        const lastName = state.lastName || state.biodata?.lastName;
        const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed Customer';
        const photoUrl = state.customerPhotoUrl || state.livenessPhotoUrl;
        const phone = state.biodata?.phone;
        
        return (
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt={customerName} className="h-9 w-9 rounded-full object-cover border border-gray-200 shrink-0" />
            ) : (
              <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', details.bg)}>
                <details.icon className={cn('h-4 w-4', details.color)} />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 whitespace-nowrap">{customerName}</span>
              {phone && <span className="text-[11px] text-gray-500 font-medium">{phone}</span>}
            </div>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Account Type',
      render: (draft) => {
        const details = getDraftDetails(draft);
        return (
          <div className="flex flex-col">
            <span className="text-gray-900 whitespace-nowrap font-medium text-[13px]">{details.title}</span>
            <span className="text-gray-500 whitespace-nowrap text-[11px]">Draft Application</span>
          </div>
        );
      },
    },
    {
      key: 'step',
      header: 'Current Step',
      render: (draft) => {
        const step = draft.draftData.step || 'IDENTITY_INPUT';
        const stepLabel = STEP_LABELS[step] || step.replace(/_/g, ' ');
        const percent = getProgressPercentage(step);
        return (
          <div className="flex flex-col gap-1.5 w-[140px]">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium text-[12px] truncate">{stepLabel}</span>
              <span className="text-[#920793] font-bold text-[11px]">{percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#920793] rounded-full transition-all duration-500" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (draft) => {
        const { clientReference } = draft.draftData.state || {};
        return <span className="text-gray-600 font-mono text-[13px] bg-gray-50 px-2 py-1 rounded-md">{clientReference || '—'}</span>;
      },
    },
    {
      key: 'date',
      header: 'Saved On',
      render: (draft) => <span className="text-gray-500 whitespace-nowrap text-[13px] font-medium">{format(new Date(draft.updatedAt), 'MMM d, yyyy h:mm a')}</span>,
    },
    {
      key: 'action',
      header: '',
      render: (draft) => {
        const details = getDraftDetails(draft);
        return (
          <div className="flex items-center gap-2 justify-end pr-2">
            <button
              onClick={(e) => { e.stopPropagation(); deleteDraft(draft.id); }}
              disabled={isDeleting}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="Delete Draft"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(details.href); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-bold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap border border-purple-100"
            >
              Resume <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  function renderCard(draft: ActivateDraft) {
    const details = getDraftDetails(draft);
    const state = draft.draftData.state || {};
    const step = draft.draftData.step || 'IDENTITY_INPUT';
    const stepLabel = STEP_LABELS[step] || step.replace(/_/g, ' ');
    
    const firstName = state.firstName || state.biodata?.firstName;
    const lastName = state.lastName || state.biodata?.lastName;
    const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed Customer';
    
    const clientReference = state.clientReference;
    const phone = state.biodata?.phone;
    const photoUrl = state.customerPhotoUrl || state.livenessPhotoUrl;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-purple-200 hover:ring-1 hover:ring-purple-100 transition-all group h-full relative overflow-hidden">
        {/* Top Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {photoUrl ? (
              <img src={photoUrl} alt={customerName} className="h-10 w-10 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', details.bg)}>
                <details.icon className={cn('h-5 w-5', details.color)} />
              </div>
            )}
            <div>
              <h3 className="text-[15px] font-bold text-gray-900 truncate max-w-[140px]">{customerName}</h3>
              <p className="text-[12px] font-medium text-gray-500 mt-0.5">{details.title}</p>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteDraft(draft.id); }}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors absolute top-4 right-4 opacity-0 group-hover:opacity-100"
            title="Delete Draft"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Content Details */}
        <div className="flex-1 mt-2 space-y-2.5">
          {phone && (
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-gray-400">Phone:</span>
              <span className="text-gray-700 font-medium">{phone}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-400">Reference:</span>
            <span className="font-mono text-gray-600 font-medium truncate max-w-[120px]">{clientReference || '—'}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-gray-400">Saved on:</span>
            <span className="text-gray-600">{format(new Date(draft.updatedAt), 'MMM d, h:mm a')}</span>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-[#920793] font-semibold">{stepLabel}</span>
              <span className="text-gray-500 font-medium">{getProgressPercentage(step)}%</span>
            </div>
            <div className="h-1.5 w-full bg-purple-50 rounded-full overflow-hidden">
              <div className="h-full bg-[#920793] rounded-full transition-all duration-500" style={{ width: `${getProgressPercentage(step)}%` }} />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <Button
            onClick={(e) => { e.stopPropagation(); router.push(details.href); }}
            className="w-full bg-purple-50 hover:bg-[#920793] text-[#920793] hover:text-white border-0 transition-colors"
            variant="outline"
          >
            Resume Application <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">Drafts</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">Resume your incomplete account opening applications.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8 text-[#920793]" />
        </div>
      ) : (
        <DataView
          data={drafts}
          columns={columns}
          renderCard={renderCard}
          keyExtractor={(d) => d.id}
          title={`${drafts.length} ${drafts.length === 1 ? 'Draft' : 'Drafts'}`}
          emptyState={
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No saved drafts</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                When you save an application for later, it will appear here.
              </p>
              <Button
                onClick={() => router.push('/account-opening/select-type')}
                className="mt-6 bg-[#920793] hover:bg-[#920793]/90 text-white"
              >
                Create New Account
              </Button>
            </div>
          }
        />
      )}
    </div>
  );
}
