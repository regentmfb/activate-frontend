'use client';

import { useState } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';
import { cn } from '@src/utils';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';

type Props = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  sub?: string;
  onClick?: () => void;
};

export function ProtectedStatCard({ label, value, icon: Icon, iconColor, iconBg, sub, onClick }: Props) {
  const [isRevealed, setIsRevealed] = useState(false);
  const { requirePin } = usePinVerification();

  const handleReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    
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
        setIsRevealed(false);
      }
    );
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm border border-gray-100',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]'
      )}
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg ?? '#f5e6f5' }}
      >
        <Icon className="h-5 w-5" style={{ color: iconColor ?? '#920793' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-gray-500 font-medium leading-none mb-1.5">{label}</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-black text-gray-900 leading-none">
            {isRevealed ? value : '••••••'}
          </p>
          <button
            onClick={handleReveal}
            className="h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            title={isRevealed ? 'Hide value' : 'Reveal value (PIN required)'}
          >
            {isRevealed ? (
              <EyeOff className="h-3.5 w-3.5 text-gray-600" />
            ) : (
              <Eye className="h-3.5 w-3.5 text-gray-600" />
            )}
          </button>
        </div>
        {sub && <p className="text-[12px] text-gray-400 mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
