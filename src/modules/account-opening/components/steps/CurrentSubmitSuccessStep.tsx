'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock, Smartphone, Home } from 'lucide-react';
import { IndividualCurrentFormState } from '../../types/wizard.types';

type Props = { formState: IndividualCurrentFormState };

export function CurrentSubmitSuccessStep({ formState }: Props) {
  const router = useRouter();
  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900">Request Submitted! 🎉</p>
          <p className="text-[12px] text-gray-500">{name}&apos;s current account request has been submitted.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
        {[
          ['Account Type', 'Individual Current'],
          ['Reference', formState.clientReference],
          ['Status', 'Pending Reference Verification'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between px-3 py-2 text-[13px]">
            <span className="text-gray-500">{k}</span>
            <span className="font-semibold text-gray-900 truncate ml-4 text-right">{v}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-start gap-2.5">
        <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-amber-800">Pending Reference Verification</p>
          <p className="text-[12px] text-amber-700 mt-0.5">
            Operations will verify the reference within 24 hours on a business day.
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 flex items-start gap-2.5">
        <Smartphone className="h-4 w-4 text-[#920793] shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-[#920793]">Onboard on Mobile App</p>
          <p className="text-[12px] text-purple-700 mt-0.5">Help the customer download and activate the RegentMFB mobile app.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push('/account-opening/select-type')}
          className="flex-1 h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity"
        >
          Open Another
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 h-9 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Home className="h-3.5 w-3.5" /> Dashboard
        </button>
      </div>
    </div>
  );
}
