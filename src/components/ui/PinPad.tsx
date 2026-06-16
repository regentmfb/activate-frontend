'use client';

import { useEffect } from 'react';
import { Delete } from 'lucide-react';
import { cn } from '@src/utils';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

interface PinPadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
  length?: number;
}

export function PinPad({ value, onChange, disabled = false, error, length = PIN_LENGTH }: PinPadProps) {
  function append(digit: string) {
    if (disabled || value.length >= length) return;
    onChange(value + digit);
  }

  function deleteLast() {
    if (disabled) return;
    onChange(value.slice(0, -1));
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (disabled) return;
      if (e.key >= '0' && e.key <= '9') { e.preventDefault(); append(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); deleteLast(); }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, disabled]);

  return (
    <div className="space-y-5">
      {/* Dots */}
      <div className="flex items-center justify-center gap-3">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-12 w-12 rounded-lg border-2 flex items-center justify-center transition-all',
              value.length > i ? 'border-[#920793] bg-purple-50' : 'border-gray-200 bg-gray-50'
            )}
          >
            {value.length > i && <div className="h-2.5 w-2.5 rounded-full bg-[#920793]" />}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-center text-[12px] text-red-600 font-medium">{error}</p>
      )}

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />;

          if (key === 'del') {
            return (
              <button
                key={i}
                type="button"
                onClick={deleteLast}
                disabled={disabled || value.length === 0}
                className="h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-30"
              >
                <Delete className="h-5 w-5" />
              </button>
            );
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => append(key)}
              disabled={disabled || value.length >= length}
              className="h-14 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-[20px] font-bold flex items-center justify-center hover:bg-purple-50 hover:border-[#920793] active:scale-95 transition-all disabled:opacity-30"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
