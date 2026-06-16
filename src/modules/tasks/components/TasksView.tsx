'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileEdit, ArrowRight, Trash2, PiggyBank, CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { TaskFilterBar } from './TaskFilterBar';
import { TaskBankView, ACCOUNT_TYPE_LABELS } from '@src/modules/dashboard/components/TaskBankView';
import { Task, TaskPriority } from '../types/tasks.types';
import { useTaskBank, useCompleteTask, useCancelTask } from '../hooks/useTaskBank';
import { useDrafts, DraftItem } from '../hooks/useDrafts';
import { ROUTES } from '@src/constants/routes';
import { cn } from '@src/utils';

const STEP_LABELS: Record<string, string> = {
  IDENTITY_INPUT: 'Identity Input',
  OTP_VERIFICATION: 'OTP Verification',
  FACE_PROCESSING: 'Face Matching',
  BIODATA_CONFIRMATION: 'Biodata Confirmation',
  PHOTO_CAPTURE: 'Photo Capture',
  ADDITIONAL_INFO: 'Additional Info',
  ID_CARD_CAPTURE: 'ID Card Capture',
  LOCATION_VERIFICATION: 'Location Verification',
  REFERENCE_UPLOAD: 'Reference Upload',
  TIER2_UPGRADE: 'Tier 2 Upgrade',
  TIER3_UPGRADE: 'Tier 3 Upgrade',
};

function DraftCard({ draft, onResume, onDiscard }: { draft: DraftItem; onResume: () => void; onDiscard: () => void }) {
  const Icon = draft.accountType === 'INDIVIDUAL_SAVINGS' ? PiggyBank : CreditCard;
  return (
    <div className="bg-white rounded-xl border border-dashed border-[#920793]/30 p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#920793]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-bold text-gray-900 truncate">
            {draft.customerName ?? 'Customer not yet identified'}
          </p>
          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-[#920793] uppercase tracking-wide">
            Draft
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {ACCOUNT_TYPE_LABELS[draft.accountType]} · Paused at {STEP_LABELS[draft.currentStep] ?? draft.currentStep}
        </p>
        <p className="text-[10px] font-mono text-gray-300 mt-0.5 truncate">{draft.clientReference}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={onDiscard}
          className="h-8 w-8 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
          title="Discard draft">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={onResume}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: '#920793' }}>
          Resume <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function TasksView() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [statusGroup, setStatusGroup] = useState<'active' | 'review' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { tasks, meta, isLoading, isFetching } = useTaskBank({
    page,
    limit: 10,
    statusGroup,
    searchQuery,
  });

  const { mutate: completeTask } = useCompleteTask();
  const { mutate: cancelTask } = useCancelTask();
  const { drafts, discardDraft } = useDrafts();

  const handlePriorityToggle = (priority: TaskPriority) =>
    setSelectedPriorities((prev) => prev.includes(priority) ? prev.filter((p) => p !== priority) : [...prev, priority]);

  const filteredTasks = tasks.filter((task) => {
    return selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
  });

  const activeCount = statusGroup === 'active' ? meta.total : 0;
  const highPriorityCount = filteredTasks.filter((t) => t.priority === 'HIGH').length;
  const showLoading = isLoading || isFetching;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">Task Bank</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">
          {showLoading ? 'Loading tasks…' : `${meta.total} tasks in this queue`}
          {highPriorityCount > 0 && ` · ${highPriorityCount} high priority visible`}
          {statusGroup === 'active' && drafts.length > 0 && ` · ${drafts.length} saved ${drafts.length === 1 ? 'draft' : 'drafts'}`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-px">
        {([
          { key: 'active',    label: 'Action Needed',     icon: Clock },
          { key: 'review',    label: 'Awaiting Review',   icon: Clock },
          { key: 'completed', label: 'Completed History', icon: CheckCircle },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusGroup(tab.key);
              setPage(1);
              setSelectedPriorities([]);
            }}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-sm font-medium transition-colors -mb-px',
              statusGroup === tab.key
                ? 'border-[#920793] text-[#920793] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <tab.icon className={cn('w-4 h-4', statusGroup === tab.key ? 'text-[#920793]' : 'text-gray-400')} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drafts Section - only show under Action Needed */}
      {statusGroup === 'active' && drafts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileEdit className="h-4 w-4 text-[#920793]" />
            <p className="text-[13px] font-bold text-gray-700">Saved Drafts ({drafts.length})</p>
          </div>
          <div className="space-y-2">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft}
                onResume={() => router.push(draft.resumeUrl)}
                onDiscard={() => discardDraft(draft.id)} />
            ))}
          </div>
        </div>
      )}

      <TaskFilterBar
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        selectedPriorities={selectedPriorities}
        onPriorityToggle={handlePriorityToggle}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters((v) => !v)}
      />

      <TaskBankView
        tasks={filteredTasks}
        isLoading={showLoading}
        onContinue={(task: Task) => router.push(ROUTES.taskDetail(task.id))}
        onComplete={(task: Task) => completeTask(task.id)}
        onCancel={(task: Task) => cancelTask(task.id)}
        title={`${filteredTasks.length} ${filteredTasks.length === 1 ? 'Task' : 'Tasks'}`}
      />

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-between py-2">
          <p className="text-[13px] text-gray-500">
            Page {meta.page} of {meta.totalPages} · {meta.total} total tasks
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                const p = meta.totalPages <= 5
                  ? i + 1
                  : page <= 3
                  ? i + 1
                  : page >= meta.totalPages - 2
                  ? meta.totalPages - 4 + i
                  : page - 2 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    disabled={isLoading}
                    className={`w-8 h-8 rounded-lg text-[13px] font-semibold transition-colors ${
                      p === page
                        ? 'text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                    style={p === page ? { backgroundColor: '#920793' } : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages || isLoading}
              className="px-3 py-1.5 rounded-lg text-[13px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
