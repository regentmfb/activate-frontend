'use client';

import { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { pinApi } from '../api/pin.api';
import { PinPad } from '@src/components/ui/PinPad';
import { useAuthStore } from '@src/store/auth.store';

const PIN_LENGTH = 4;

type Step = 'enter' | 'confirm';

export function PinSetupModal() {
  const setHasPin = useAuthStore((s) => s.setHasPin);

  const [step, setStep] = useState<Step>('enter');
  const [firstPin, setFirstPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleFirstPinChange(val: string) {
    setFirstPin(val);
    if (error) setError('');
    if (val.length === PIN_LENGTH) {
      // Small delay so the last dot fills in visually before transitioning
      setTimeout(() => setStep('confirm'), 150);
    }
  }

  function handleConfirmPinChange(val: string) {
    setConfirmPin(val);
    if (error) setError('');
    if (val.length === PIN_LENGTH) {
      handleSubmit(val);
    }
  }

  async function handleSubmit(confirm: string) {
    if (confirm !== firstPin) {
      setError('PINs do not match. Please start again.');
      setTimeout(() => {
        setStep('enter');
        setFirstPin('');
        setConfirmPin('');
        setError('');
      }, 1500);
      return;
    }

    setIsSubmitting(true);
    try {
      await pinApi.setup(firstPin, confirm);
      setSuccess(true);
      // Brief success animation, then unlock the dashboard
      setTimeout(() => setHasPin(true), 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to set PIN. Please try again.';
      setError(msg);
      setStep('enter');
      setFirstPin('');
      setConfirmPin('');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    setStep('enter');
    setFirstPin('');
    setConfirmPin('');
    setError('');
  }

  return (
    /* Full-screen, non-dismissible overlay — no X button, no backdrop click handler */
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-[#920793]" />
          </div>
          <h2 className="text-[17px] font-bold text-gray-900">Set Your Security PIN</h2>
          <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">
            Create a 4-digit PIN to secure sensitive customer data.
            You&apos;ll use this every time you need to reveal protected information.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 pt-4 px-6">
          <div className={`h-1.5 w-16 rounded-full transition-colors ${step === 'enter' ? 'bg-[#920793]' : 'bg-[#920793]'}`} />
          <div className={`h-1.5 w-16 rounded-full transition-colors ${step === 'confirm' ? 'bg-[#920793]' : 'bg-gray-200'}`} />
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-1.5 mb-1">
          {step === 'enter' ? 'Step 1 of 2 — Enter PIN' : 'Step 2 of 2 — Confirm PIN'}
        </p>

        {/* Pin pad area */}
        <div className="px-6 py-5">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-[14px] font-semibold text-gray-800">PIN set successfully!</p>
              <p className="text-[12px] text-gray-400">Unlocking your dashboard…</p>
            </div>
          ) : (
            <>
              {step === 'enter' ? (
                <PinPad
                  value={firstPin}
                  onChange={handleFirstPinChange}
                  disabled={isSubmitting}
                  error=""
                />
              ) : (
                <PinPad
                  value={confirmPin}
                  onChange={handleConfirmPinChange}
                  disabled={isSubmitting}
                  error=""
                />
              )}

              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <p className="text-[12px] text-red-600">{error}</p>
                </div>
              )}

              {isSubmitting && (
                <p className="text-center text-[12px] text-gray-400 mt-3">Setting PIN…</p>
              )}

              {step === 'confirm' && !isSubmitting && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mt-3 w-full text-center text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Re-enter first PIN
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer note */}
        {!success && (
          <div className="px-6 pb-5">
            <p className="text-center text-[11px] text-gray-400">
              This PIN is stored securely. You cannot access the dashboard until it is set.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
