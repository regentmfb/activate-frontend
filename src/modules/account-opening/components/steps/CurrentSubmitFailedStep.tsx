'use client';

import { useRouter } from 'next/navigation';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { IndividualCurrentFormState } from '../../types/wizard.types';

type Props = {
  formState: IndividualCurrentFormState;
  failureReason?: string;
  onRetry: () => void;
  onCancel?: () => void;
};

export function CurrentSubmitFailedStep({ formState, failureReason, onRetry, onCancel }: Props) {
  const router = useRouter();
  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900">Submission Failed</p>
          <p className="text-[12px] text-gray-500">{name}&apos;s current account request could not be submitted.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
        {[
          ['Account Type', 'Individual Current'],
          ['Reference', formState.clientReference],
          ['Status', 'Failed'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between px-3 py-2 text-[13px]">
            <span className="text-gray-500">{k}</span>
            <span className="font-semibold text-gray-900 truncate ml-4 text-right">{v}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
        <p className="text-[12px] font-semibold text-red-700">Reason</p>
        <p className="text-[12px] text-red-600 mt-0.5">
          {failureReason ?? 'An error occurred while submitting the request. Please try again.'}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Retry Submission
      </button>

      <button
        onClick={() => onCancel ? onCancel() : router.push('/dashboard')}
        className="w-full h-9 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
      >
        <Home className="h-3.5 w-3.5" /> Dashboard
      </button>
    </div>
  );
}
