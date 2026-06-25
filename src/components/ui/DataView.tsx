'use client';

import { useState } from 'react';
import { LayoutGrid, Table2 } from 'lucide-react';
import { cn } from '@src/utils';

export type ColumnDef<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

type Props<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  renderCard: (row: T) => React.ReactNode;
  keyExtractor: (row: T) => string;
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  gridCols?: string;
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
};

export function DataView<T>({
  data,
  columns,
  renderCard,
  keyExtractor,
  title,
  maxItems,
  onViewAll,
  emptyMessage = 'No records found.',
  emptyState,
  gridCols = 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  isLoading,
  onRowClick,
}: Props<T>) {
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const displayed = maxItems ? data.slice(0, maxItems) : data;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-100 flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      {(title || onViewAll) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-[16px] font-bold text-gray-900">{title}</h2>}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  view === 'grid' ? 'bg-white shadow-sm text-[#920793]' : 'text-gray-400 hover:text-gray-600'
                )}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('table')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  view === 'table' ? 'bg-white shadow-sm text-[#920793]' : 'text-gray-400 hover:text-gray-600'
                )}
                title="Table view"
              >
                <Table2 className="h-4 w-4" />
              </button>
            </div>
            {onViewAll && data.length > (maxItems ?? 0) && (
              <button
                onClick={onViewAll}
                className="text-[13px] font-semibold text-[#920793] hover:underline"
              >
                View all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.length === 0 ? (
        emptyState ? (
          emptyState
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-gray-400 text-[14px]">{emptyMessage}</p>
          </div>
        )
      ) : view === 'grid' ? (
        <div className={cn('grid gap-3', gridCols)}>
          {displayed.map((row) => (
            <div
              key={keyExtractor(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(onRowClick && 'cursor-pointer hover:shadow-md transition-shadow')}
            >
              {renderCard(row)}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={cn(
                        'text-left px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap',
                        col.className
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map((row) => (
                  <tr
                    key={keyExtractor(row)}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      'hover:bg-gray-50 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn('px-4 py-3', col.className)}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
