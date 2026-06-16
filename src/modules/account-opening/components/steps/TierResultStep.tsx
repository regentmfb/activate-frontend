'use client';

import { CheckCircle2, XCircle, RefreshCw, ChevronRight, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@src/utils';

type DetailRow = { label: string; value: React.ReactNode } | [string, React.ReactNode];

type Props = {
  success: boolean;
  tier: 1 | 2 | 3;
  customerName: string;
  details: DetailRow[];
  // Success actions
  onUpgrade?: () => void;
  upgradeLabel?: string;
  onFinish?: () => void;
  // Failed actions
  onRetry?: () => void;
  failureReason?: string;
};

export function TierResultStep({
  success,
  tier,
  customerName,
  details,
  onUpgrade,
  upgradeLabel,
  onFinish,
  onRetry,
  failureReason,
}: Props) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
          success ? 'bg-green-50' : 'bg-red-50'
        )}>
          {success
            ? <CheckCircle2 className="h-5 w-5 text-green-500" />
            : <XCircle className="h-5 w-5 text-red-500" />
          }
        </div>
        <div>
          <p className="text-[14px] font-bold text-gray-900">
            {success
              ? `Tier ${tier} ${tier === 3 ? 'Upgrade Complete!' : 'Account Created!'}`
              : `Tier ${tier} ${tier === 1 ? 'Account Creation' : 'Upgrade'} Failed`
            }
          </p>
          <p className="text-[12px] text-gray-500">
            {success
              ? `${customerName}'s account has been ${tier === 1 ? 'created' : 'upgraded'} successfully.`
              : `Could not ${tier === 1 ? 'create' : 'upgrade'} ${customerName}'s account.`
            }
          </p>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
        {details.map((row) => {
          const label = Array.isArray(row) ? row[0] : row.label;
          const value = Array.isArray(row) ? row[1] : row.value;
          return (
            <div key={label} className="flex justify-between px-3 py-2 text-[13px]">
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold text-gray-900 truncate ml-4 text-right max-w-[55%]">{value}</span>
            </div>
          );
        })}
      </div>

      {/* Success notice */}
      {success && (
        <div className="rounded-lg bg-purple-50 border border-purple-100 px-3 py-2">
          <p className="text-[12px] text-[#920793]">SMS and email sent to customer with account details.</p>
        </div>
      )}

      {/* Failure reason */}
      {!success && failureReason && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <p className="text-[12px] font-semibold text-red-700">Reason</p>
          <p className="text-[12px] text-red-600 mt-0.5">{failureReason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {success && onUpgrade && upgradeLabel && (
          <button
            onClick={onUpgrade}
            className="w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            {upgradeLabel} <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {!success && onRetry && (
          <button
            onClick={onRetry}
            className="w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        )}

        <div className="flex gap-2">
          {(success || !onRetry) && (
            <button
              onClick={() => router.push('/account-opening/select-type')}
              className={cn(
                'h-9 rounded-lg text-[13px] font-semibold transition-opacity',
                onUpgrade ? 'flex-1 text-gray-600 border border-gray-200 hover:bg-gray-50' : 'flex-1 text-white bg-[#920793] hover:opacity-90'
              )}
            >
              Open Another
            </button>
          )}
          <button
            onClick={() => onFinish ? onFinish() : router.push('/dashboard')}
            className="flex-1 h-9 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="h-3.5 w-3.5" /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
