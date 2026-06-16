'use client';

import { useState } from 'react';
import { AlertCircle, ScanFace } from 'lucide-react';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useSwitchToManual, useVerificationSession } from '@src/modules/identity/hooks/useIdentityVerification';
import { appToast } from '@src/lib/toast';
import { useQoreIDLiveness } from '../../liveness/useQoreIDLiveness';

type Props = {
  formState: IndividualSavingsFormState;
  onNext: (data: Partial<IndividualSavingsFormState>) => void;
  onManual: () => void;
  onLiveness: () => void;
};

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function OtpVerificationStep({ formState, onNext, onManual, onLiveness }: Props) {
  const { mutate: switchToManual, isPending: isSwitching } = useSwitchToManual();
  
  const { triggerLiveness, status: livenessStatus } = useQoreIDLiveness({
    formState,
    onSuccess: (imageData) => {
      onLiveness();
      onNext({
        livenessPhotoUrl: imageData,
        customerPhotoUrl: imageData,
      });
    },
  });

  const { data: session } = useVerificationSession(formState.verificationId ?? '', {
    enabled: !!formState.verificationId,
  });

  const isFailed = session?.status === 'FAILED';

  function handleManual() {
    if (!formState.verificationId) { 
      onManual(); 
      return; 
    }
    switchToManual(
      { verificationId: formState.verificationId, reason: 'Customer unable to complete liveness check' },
      { onSuccess: () => onManual(), onError: () => onManual() }
    );
  }

  function handleLiveness() {
    triggerLiveness();
  }

  if (isFailed) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-700">Verification Failed</p>
            <p className="text-[12px] text-red-600 mt-0.5">
              {session?.manualModeReason ?? 'The BVN/NIN details could not be verified. Please check the details and try again.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManual}
            disabled={isSwitching}
            className="flex-1 h-9 rounded-lg text-[13px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSwitching ? 'Switching…' : 'Manual Mode'}
          </button>
          <button
            type="button"
            onClick={handleLiveness}
            className="flex-1 h-9 rounded-lg text-[13px] font-semibold border border-[#920793] text-[#920793] hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            Retry Liveness Check
          </button>
        </div>
      </div>
    );
  }

  if (livenessStatus === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <svg className="animate-spin h-6 w-6 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-gray-700">Opening QoreID camera…</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Please align the customer's face in the camera frame once the scanner loads.</p>
        </div>
      </div>
    );
  }

  if (livenessStatus === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <svg className="animate-spin h-6 w-6 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-gray-700">Verifying liveness check…</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Checking captured image for biometric spoofing and retrieving customer biodata.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Liveness Verification</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Verify the customer&apos;s identity with a live facial scan. This automatically validates their {formState.verificationMethod} against national records.
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 flex items-center gap-2">
        <ScanFace className="h-4 w-4 text-blue-500 shrink-0" />
        <p className="text-[12px] text-blue-700 font-medium">
          Powered by <span className="font-bold">QoreID</span> detects biometric spoofing attacks.
        </p>
      </div>

      <button
        type="button"
        onClick={handleLiveness}
        className="w-full h-[120px] rounded-xl border-2 border-dashed border-[#920793] flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 transition-all"
      >
        <ScanFace className="h-10 w-10 text-[#920793]" />
        <p className="text-[13px] font-semibold text-[#920793]">
          Start Liveness Check
        </p>
      </button>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2 mt-4">
        <p className="text-[12px] font-semibold text-amber-800">Cannot use camera or liveness failed?</p>
        <p className="text-[12px] text-amber-700">
          You can bypass this step using manual verification. The account will require review by Operations before activation.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={handleManual}
            disabled={isSwitching}
            className="w-full h-9 rounded-lg text-[13px] font-bold border border-amber-300 text-amber-800 hover:bg-amber-100/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwitching ? 'Switching to Manual Mode…' : 'Proceed with Manual Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
