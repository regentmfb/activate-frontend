'use client';

import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useComplianceAccounts } from '../hooks/useWorkflow';
import { cn } from '@/src/utils';

const SUMMARY_CARDS = [
  {
    key: 'pending',
    label: 'Pending Review',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    filter: (accounts: any[]) => accounts.filter(a => a.status === 'SUBMITTED'),
  },
  {
    key: 'approved',
    label: 'Approved',
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    filter: (accounts: any[]) => accounts.filter(a => a.status === 'APPROVED'),
  },
  {
    key: 'rejected',
    label: 'Non-Compliant',
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    filter: (accounts: any[]) => accounts.filter(a => a.status === 'REJECTED'),
  },
];

export function ComplianceReviewSummary() {
  const { data: accounts = [], isLoading } = useComplianceAccounts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {SUMMARY_CARDS.map(card => {
        const Icon = card.icon;
        const filteredAccounts = card.filter(accounts);
        const count = filteredAccounts.length;

        return (
          <div
            key={card.key}
            className={cn(
              'bg-white rounded-2xl border p-6 shadow-sm',
              card.border
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
              <div className={cn('p-3 rounded-full', card.bg)}>
                <Icon className={cn('w-6 h-6', card.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}