'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { cn } from '@src/utils';

export type PeriodFilter = {
  period?: 'week' | 'month' | 'ytd';
  startDate?: string;
  endDate?: string;
};

type Props = {
  value: PeriodFilter;
  onChange: (filter: PeriodFilter) => void;
};

const PRESETS = [
  { key: 'week',  label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'ytd',   label: 'YTD' },
] as const;

export function PeriodSelector({ value, onChange }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [startDate, setStartDate] = useState(value.startDate ?? '');
  const [endDate, setEndDate] = useState(value.endDate ?? '');

  const isCustom = !value.period && (value.startDate || value.endDate);

  function applyCustom() {
    if (!startDate || !endDate) return;
    onChange({ startDate, endDate });
    setShowCustom(false);
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-1">
        {/* Preset pills */}
        <div className="flex items-center rounded-xl overflow-hidden border border-gray-200">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => { onChange({ period: p.key }); setShowCustom(false); }}
              className={cn(
                'px-3 py-1.5 text-[12px] font-bold transition-all border-r border-gray-200 last:border-r-0',
                value.period === p.key ? 'text-white' : 'bg-white text-gray-400 hover:text-gray-600'
              )}
              style={value.period === p.key ? { backgroundColor: '#920793' } : undefined}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom date toggle */}
        <button
          onClick={() => setShowCustom((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all',
            isCustom
              ? 'text-white border-transparent'
              : showCustom
              ? 'bg-gray-100 text-gray-600 border-gray-200'
              : 'bg-white text-gray-400 border-gray-200 hover:text-gray-600'
          )}
          style={isCustom ? { backgroundColor: '#920793' } : undefined}
        >
          <CalendarDays className="h-3.5 w-3.5" />
          {isCustom ? `${value.startDate} – ${value.endDate}` : 'Custom'}
        </button>
      </div>

      {/* Custom date dropdown */}
      {showCustom && (
        <div className="absolute right-0 top-full mt-2 z-20 bg-white rounded-2xl border border-gray-100 shadow-xl p-4 space-y-3 w-64">
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-wide">Custom Date Range</p>
          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border border-gray-200 outline-none focus:border-[#920793] transition-colors"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border border-gray-200 outline-none focus:border-[#920793] transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCustom(false)}
              className="flex-1 h-9 rounded-xl border border-gray-200 text-[13px] font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyCustom}
              disabled={!startDate || !endDate}
              className="flex-1 h-9 rounded-xl text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
