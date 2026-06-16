'use client';

import { Search, Filter } from 'lucide-react';
import { TaskPriority } from '../types/tasks.types';

type Props = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedPriorities: TaskPriority[];
  onPriorityToggle: (priority: TaskPriority) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export function TaskFilterBar({
  searchQuery,
  onSearchChange,
  selectedPriorities,
  onPriorityToggle,
  showFilters,
  onToggleFilters,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by customer name, title, or request ID..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent"
          />
        </div>
        <button
          onClick={onToggleFilters}
          className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors ${
            showFilters ? 'bg-[#920793] text-white border-[#920793]' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-[12px] font-semibold text-gray-700 mb-2">Priority</p>
          <div className="flex flex-wrap gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onPriorityToggle(option.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                  selectedPriorities.includes(option.value)
                    ? 'bg-[#920793] text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
