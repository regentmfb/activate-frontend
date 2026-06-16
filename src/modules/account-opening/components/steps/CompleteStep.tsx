'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2, Smartphone, Home, Loader2 } from 'lucide-react';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useAccountRequest } from '../../hooks/useAccountOpening';

type Props = { formState: IndividualSavingsFormState; };

export function CompleteStep({ formState }: Props) {
  const router = useRouter();
  
  const { data: request } = useAccountRequest(formState.accountRequestId || '', {
    enabled: !formState.accountNumber && !!formState.accountRequestId,
    refetchInterval: formState.accountNumber ? false : 3000,
  });

  const resolvedAccountNumber = formState.accountNumber || request?.bankOneAccountNumber;
  const accountNumberDisplay = resolvedAccountNumber || (
    <span className="flex items-center justify-end gap-1.5 text-[#920793]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>Creating account...</span>
    </span>
  );

  const name = formState.biodata ? `${formState.biodata.firstName} ${formState.biodata.lastName}` : 'Customer';
  const tier = formState.gpsCoords ? 'Tier 3' : formState.idCardPhotoUrl ? 'Tier 2' : 'Tier 1';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-[#920793]" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900">All Done! 🎉</p>
          <p className="text-[12px] text-gray-500">{name}&apos;s Individual Savings Account is fully set up.</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
        {(
          [
            ['Account Number', accountNumberDisplay],
            ['Account Type', 'Individual Savings'],
            ['Tier', tier],
          ] as [string, React.ReactNode][]
        ).map(([k, v]) => (
          <div key={k} className="flex justify-between px-3 py-2 text-[13px]">
            <span className="text-gray-500">{k}</span>
            <span className="font-semibold text-gray-900">{v}</span>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 flex items-start gap-2.5">
        <Smartphone className="h-4 w-4 text-[#920793] shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-[#920793]">Onboard on Mobile App</p>
          <p className="text-[12px] text-purple-700 mt-0.5">Help the customer download and activate the RegentMFB mobile app.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => router.push('/account-opening/select-type')}
          className="flex-1 h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity">
          Open Another
        </button>
        <button onClick={() => router.push('/dashboard')}
          className="flex-1 h-9 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5">
          <Home className="h-3.5 w-3.5" /> Dashboard
        </button>
      </div>
    </div>
  );
}
