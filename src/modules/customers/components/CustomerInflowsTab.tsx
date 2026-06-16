'use client';

import { useState } from 'react';
import { ArrowDownCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCustomerInflows } from '../hooks/useCustomers';
import { Button } from '@src/components/ui/button';
import { cn } from '@src/utils';
import type { CustomerInflow } from '../types/customers.types';

type Props = {
  customerId: string;
  revealToken?: string;
};

function formatAmount(amount: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function CustomerInflowsTab({ customerId, revealToken }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCustomerInflows(customerId, page, revealToken);

  const inflows: CustomerInflow[] = data?.inflows ?? [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <svg className="animate-spin h-6 w-6 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
      </div>
    );
  }

  if (inflows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <ArrowDownCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-[14px] text-gray-400">No inflows recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      {pagination && (
        <div className="bg-green-50 rounded-xl border border-green-100 px-4 py-3 flex items-center gap-2">
          <ArrowDownCircle className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-[13px] font-semibold text-green-700">
            {pagination.total} inflow transaction{pagination.total !== 1 ? 's' : ''} found
          </p>
        </div>
      )}

      <div className="space-y-2">
        {inflows.map((inflow) => (
          <div
            key={inflow.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3 flex items-start gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <ArrowDownCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{inflow.narration || 'Inflow'}</p>
                  {inflow.senderName && (
                    <p className="text-[11px] text-gray-500 truncate">
                      From: {inflow.senderName}
                      {inflow.senderAccount && ` (${inflow.senderAccount})`}
                    </p>
                  )}
                </div>
                <p className="text-[14px] font-black text-green-700 shrink-0">
                  +{formatAmount(inflow.amount, inflow.currency)}
                </p>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[11px] text-gray-400">{formatDate(inflow.createdAt)}</p>
                {inflow.channel && (
                  <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {inflow.channel}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-mono text-gray-300 mt-0.5">{inflow.transactionRef}</p>
            </div>
          </div>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 py-2">
          <p className="text-[12px] text-gray-500">
            Page {page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
