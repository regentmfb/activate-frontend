'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { usePinVerification } from '../hooks/usePinVerification';
import { formatCurrency } from '@src/utils';

type Props = {
  value: number;
  label?: string;
};

export function ProtectedValue({ value, label = 'Portfolio Value' }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { requirePin } = usePinVerification();

  const handleReveal = () => {
    if (isRevealed) {
      setIsRevealed(false);
      return;
    }

    requirePin(
      'VIEW_PORTFOLIO_VALUE',
      () => {
        setIsRevealed(true);
      },
      () => {
        // User cancelled PIN entry
        setIsRevealed(false);
      }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-black text-gray-900">
        {isRevealed ? formatCurrency(value) : '••••••'}
      </span>
      <button
        onClick={handleReveal}
        className="h-8 w-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        title={isRevealed ? 'Hide value' : 'Reveal value'}
      >
        {isRevealed ? (
          <EyeOff className="h-4 w-4 text-gray-600" />
        ) : (
          <Eye className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}
