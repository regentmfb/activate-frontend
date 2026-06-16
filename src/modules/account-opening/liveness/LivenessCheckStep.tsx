'use client';

import { useState } from 'react';
import { ScanFace, CheckCircle2, AlertCircle } from 'lucide-react';
import { IndividualSavingsFormState } from '../types/wizard.types';
import { useQoreIDLiveness } from './useQoreIDLiveness';

type Props = {
  formState: IndividualSavingsFormState;
  onNext: (data: Partial<IndividualSavingsFormState>) => void;
};

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function LivenessCheckStep({ formState, onNext }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(formState.livenessPhotoUrl ?? null);

  const { triggerLiveness, status } = useQoreIDLiveness({
    formState,
    onSuccess: (imageData) => {
      setPhotoUrl(imageData);
      onNext({
        livenessPhotoUrl: imageData,
        customerPhotoUrl: imageData,
      });
    },
    onFail: () => {
      setPhotoUrl(null);
    }
  });

  function handleContinue() {
    onNext({
      livenessPhotoUrl: photoUrl!,
      customerPhotoUrl: photoUrl!,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Liveness Check</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Capture the customer&apos;s face live using QoreID. This photo will also be used as their account photo.
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 flex items-center gap-2">
        <ScanFace className="h-4 w-4 text-blue-500 shrink-0" />
        <p className="text-[12px] text-blue-700 font-medium">
          Powered by <span className="font-bold">QoreID</span> — detects biometric spoofing attacks and validates against national records.
        </p>
      </div>

      {/* Photo capture area */}
      {photoUrl ? (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={photoUrl}
              alt="Liveness capture"
              className="w-24 h-24 rounded-full object-cover border-[3px] border-[#920793]"
            />
            {status === 'passed' && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            {status === 'failed' && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
                <AlertCircle className="h-3.5 w-3.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[13px] font-semibold text-gray-800">
              {status === 'passed'
                ? 'Liveness check passed ✓'
                : status === 'failed'
                ? 'Liveness check failed — please retake'
                : status === 'verifying'
                ? 'Verifying…'
                : 'Photo captured'}
            </p>
            <button
              type="button"
              onClick={triggerLiveness}
              disabled={status === 'verifying'}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#920793] hover:underline disabled:opacity-50"
            >
              <ScanFace className="h-3 w-3" /> Retake with QoreID
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerLiveness}
          disabled={status === 'scanning' || status === 'verifying'}
          className="w-full h-[120px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-[#920793] hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ScanFace className="h-10 w-10 text-gray-300" />
          <p className="text-[13px] font-semibold text-gray-400">
            {status === 'scanning' || status === 'verifying' ? 'Loading QoreID widget…' : 'Tap to open QoreID liveness scanner'}
          </p>
          <p className="text-[11px] text-gray-400 max-w-xs text-center">
            Powered by QoreID anti-spoofing technology
          </p>
        </button>
      )}

      {/* Continue — only after passed */}
      {status === 'passed' && (
        <button type="button" onClick={handleContinue} className={btn}>
          Continue
        </button>
      )}

      {status !== 'passed' && (
        <button type="button" disabled className={btn}>
          Capture and verify liveness photo to continue
        </button>
      )}
    </div>
  );
}
