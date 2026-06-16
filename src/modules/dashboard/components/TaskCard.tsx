import { ArrowRight } from 'lucide-react';
import { cn } from '@src/utils';
import { Task, TaskPriority } from '@src/modules/tasks/types/tasks.types';
import { TASK_STATUS_LABELS, TASK_PRIORITY_STYLES, ACCOUNT_TYPE_LABELS } from '@src/constants/labels';

const STATUS_LABELS = TASK_STATUS_LABELS;
const PRIORITY_STYLES = TASK_PRIORITY_STYLES;

type Props = {
  task: Task;
  onContinue: (task: Task) => void;
};

export function TaskCard({ task, onContinue }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              'text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide',
              PRIORITY_STYLES[task.priority]
            )}
          >
            {task.priority}
          </span>
          <span className="text-[12px] text-gray-400">
            {ACCOUNT_TYPE_LABELS[task.accountType] ?? task.accountType}
          </span>
        </div>
        <p className="text-[15px] font-semibold text-gray-900 truncate">{task.customerName}</p>
        <p className="text-[13px] text-gray-500 mt-0.5">{STATUS_LABELS[task.status]}</p>
        <p className="text-[11px] text-gray-400 mt-1">
          Updated {new Date(task.updatedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <button
        onClick={() => onContinue(task)}
        className="shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors"
      >
        Continue
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
