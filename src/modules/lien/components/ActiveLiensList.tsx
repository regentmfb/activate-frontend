'use client';

import { useState } from 'react';
import { Shield, AlertCircle, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { useActiveLiens, useReleaseLien } from '../hooks/useLien';
import { DataView, type ColumnDef } from '@src/components/ui/DataView';
import { Button } from '@src/components/ui/button';
import { Badge } from '@src/components/ui/badge';
import type { ActiveLien } from '../types/lien.types';
import { cn } from '@src/utils';

type Props = {
  title?: string;
  onRelease?: (lien: ActiveLien) => void;
};

export function ActiveLiensList({ title = 'Active Liens', onRelease }: Props) {
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data, isLoading, error } = useActiveLiens(page, limit);
  const { mutate: releaseLien } = useReleaseLien();

  const liens = data?.liens ?? [];
  const pagination = data?.pagination;

  const handleRelease = (lien: ActiveLien) => {
    if (onRelease) {
      onRelease(lien);
    } else {
      releaseLien({ accountNumber: lien.accountNumber });
    }
  };

  const columns: ColumnDef<ActiveLien>[] = [
    {
      key: 'account',
      header: 'Account',
      render: (lien) => (
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-semibold text-gray-900">{lien.accountNumber}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{lien.reference}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (lien) => (
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-semibold text-gray-900">
            ₦{lien.amount.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (lien) => (
        <p className="text-[12px] text-gray-600 max-w-[200px] truncate">{lien.reason}</p>
      ),
    },
    {
      key: 'placed',
      header: 'Placed By',
      render: (lien) => (
        <div className="min-w-0">
          <p className="text-[12px] text-gray-600">{lien.placedBy}</p>
          <p className="text-[11px] text-gray-400">
            {new Date(lien.placedAt).toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (lien) => (
        <Button
          onClick={() => handleRelease(lien)}
          size="sm"
          variant="outline"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Release
        </Button>
      ),
    },
  ];

  function renderCard(lien: ActiveLien) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="font-mono text-[13px] font-semibold text-gray-900">{lien.accountNumber}</p>
              <p className="text-[11px] text-gray-400">{lien.reference}</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            ₦{lien.amount.toLocaleString()}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 text-gray-400 mt-0.5" />
            <p className="text-[12px] text-gray-600 flex-1">{lien.reason}</p>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Placed by {lien.placedBy} on{' '}
              {new Date(lien.placedAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>

        <Button
          onClick={() => handleRelease(lien)}
          size="sm"
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          Release Lien
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataView
        data={liens}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={(lien) => lien.id}
        title={title}
        isLoading={isLoading}
        emptyMessage="No active liens found"
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-lg border border-gray-100">
          <div className="text-[12px] text-gray-600">
            Showing {liens.length} of {pagination.total} liens
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[12px] text-gray-600 px-2">
              Page {page} of {pagination.totalPages}
            </span>
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
