'use client';

import { ArrowRight } from 'lucide-react';
import { cn } from '@src/utils';
import { Task, TaskPriority } from '@src/modules/tasks/types/tasks.types';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { TASK_STATUS_LABELS, TASK_PRIORITY_STYLES, ACCOUNT_TYPE_LABELS } from '@src/constants/labels';

export const STATUS_LABELS = TASK_STATUS_LABELS;
export const ACCOUNT_TYPE_LABELS_EXPORT = ACCOUNT_TYPE_LABELS;
// Keep backward-compat export used by TasksView
export { ACCOUNT_TYPE_LABELS };

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  URGENT: 'bg-red-600 text-white border border-red-700',
  HIGH:   'bg-red-100 text-red-700 border border-red-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border border-amber-200',
  LOW:    'bg-blue-100 text-blue-700 border border-blue-200',
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_ACTION: 'bg-amber-100 text-amber-700 border-amber-200',
  PENDING_UPLOAD: 'bg-blue-100 text-blue-700 border-blue-200',
  PENDING_VERIFICATION: 'bg-purple-100 text-purple-700 border-purple-200',
  PENDING_REVIEW: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  FAILED_RETRYABLE: 'bg-orange-100 text-orange-700 border-orange-200',
  FAILED_MANUAL_REVIEW: 'bg-red-100 text-red-700 border-red-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-100 text-gray-700 border-gray-200',
};

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide', PRIORITY_STYLES[priority])}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border', STATUS_STYLES[status] || 'bg-gray-100 text-gray-600 border-gray-200')}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function ContinueButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap"
    >
      Continue <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

type Props = {
  tasks: Task[];
  onContinue: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onCancel?: (task: Task) => void;
  isLoading?: boolean;
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
};

export function TaskBankView({ tasks, onContinue, onComplete, onCancel, isLoading, title = 'Task Bank', maxItems, onViewAll }: Props) {  const columns: ColumnDef<Task>[] = [
    {
      key: 'customer',
      header: 'Task',
      render: (t) => (
        <div className="min-w-0">
          <p className="font-medium text-gray-900 whitespace-nowrap">{t.title ?? t.customerName}</p>
          {t.description && <p className="text-[11px] text-gray-400 truncate max-w-[240px]">{t.description}</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => <PriorityBadge priority={t.priority} />,
    },
    {
      key: 'updatedAt',
      header: 'Created',
      render: (t) => (
        <span className="text-gray-400 whitespace-nowrap text-[13px]">
          {new Date(t.createdAt ?? t.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (t) => (
        <div className="flex items-center justify-end">
          <ContinueButton onClick={() => onContinue(t)} />
        </div>
      ),
    },
  ];

  function renderCard(task: Task) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-gray-900">{task.title ?? task.customerName}</p>
          {task.description && <p className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>}
          <p className="text-[11px] text-gray-400 mt-1.5">
            {new Date(task.createdAt ?? task.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center justify-end">
          <ContinueButton onClick={() => onContinue(task)} />
        </div>
      </div>
    );
  }

  return (
    <DataView
      data={tasks}
      columns={columns}
      renderCard={renderCard}
      keyExtractor={(t) => t.id}
      title={title}
      maxItems={maxItems}
      onViewAll={onViewAll}
      isLoading={isLoading}
      emptyMessage="No pending tasks. You're all caught up!"
    />
  );
}
