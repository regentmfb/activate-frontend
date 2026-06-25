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
  const { data: drafts = [], isLoading } = useGetDrafts();
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

  const columns: ColumnDef<ActivateDraft>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (draft) => {
        const details = getDraftDetails(draft);
        const { firstName, lastName } = draft.draftData.state || {};
        const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed Customer';
        
        return (
          <div className="flex items-center gap-3">
            <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', details.bg)}>
              <details.icon className={cn('h-4 w-4', details.color)} />
            </div>
            <span className="font-medium text-gray-900 whitespace-nowrap">{customerName}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Account Type',
      render: (draft) => {
        const details = getDraftDetails(draft);
        return <span className="text-gray-500 whitespace-nowrap font-medium text-[13px]">{details.title}</span>;
      },
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (draft) => {
        const { clientReference } = draft.draftData.state || {};
        return <span className="text-gray-600 font-mono text-[13px]">{clientReference || '—'}</span>;
      },
    },
    {
      key: 'date',
      header: 'Saved On',
      render: (draft) => <span className="text-gray-500 whitespace-nowrap text-[13px]">{format(new Date(draft.updatedAt), 'MMM d, yyyy h:mm a')}</span>,
    },
    {
      key: 'action',
      header: '',
      render: (draft) => {
        const details = getDraftDetails(draft);
        return (
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap"
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
    const { firstName, lastName, clientReference } = draft.draftData.state || {};
    const customerName = [firstName, lastName].filter(Boolean).join(' ') || 'Unnamed Customer';

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-purple-100 transition-all group h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', details.bg)}>
            <details.icon className={cn('h-5 w-5', details.color)} />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); deleteDraft(draft.id); }}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Draft"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1">
          <h3 className="text-[15px] font-bold text-gray-900 truncate">{customerName}</h3>
          <p className="text-[12px] font-medium text-gray-500 mt-0.5">{details.title}</p>
          
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Reference:</span>
              <span className="font-mono text-gray-600 truncate max-w-[120px]">{clientReference || '—'}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-400">Saved on:</span>
              <span className="text-gray-600">{format(new Date(draft.updatedAt), 'MMM d, yyyy h:mm a')}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <Button
            onClick={(e) => { e.stopPropagation(); router.push(details.href); }}
            className="w-full bg-gray-50 hover:bg-[#920793]/10 text-gray-700 hover:text-[#920793] border-0"
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
