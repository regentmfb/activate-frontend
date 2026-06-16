'use client';

import { useState } from 'react';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { pinApi } from '../api/pin.api';
import { PinPad } from '@src/components/ui/PinPad';

type Step = 'current' | 'new' | 'confirm';

interface ChangePinModalProps {
  onClose: () => void;
}

export function ChangePinModal({ onClose }: ChangePinModalProps) {
  const [step, setStep] = useState<Step>('current');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const PIN_LENGTH = 4;

  function handleCurrentPinChange(val: string) {
    setCurrentPin(val);
    if (error) setError('');
    if (val.length === PIN_LENGTH) setTimeout(() => setStep('new'), 150);
  }

  function handleNewPinChange(val: string) {
    setNewPin(val);
    if (error) setError('');
    if (val.length === PIN_LENGTH) setTimeout(() => setStep('confirm'), 150);
  }

  function handleConfirmPinChange(val: string) {
    setConfirmPin(val);
    if (error) setError('');
    if (val.length === PIN_LENGTH) handleSubmit(val);
  }

  async function handleSubmit(confirm: string) {
    if (confirm !== newPin) {
      setError('New PINs do not match. Please try again.');
      setTimeout(() => {
        setStep('new');
        setNewPin('');
        setConfirmPin('');
        setError('');
      }, 1500);
      return;
    }

    setIsSubmitting(true);
    try {
      await pinApi.change(currentPin, newPin, confirm);
      setSuccess(true);
      setTimeout(onClose, 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to change PIN.';
      setError(msg);
      // Reset to beginning so they can try again
      setTimeout(() => {
        setStep('current');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
        setError('');
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepConfig: Record<Step, { label: string; subtitle: string; value: string; onChange: (v: string) => void }> = {
    current: {
      label: 'Step 1 of 3 — Current PIN',
      subtitle: 'Enter your current 4-digit PIN',
      value: currentPin,
      onChange: handleCurrentPinChange,
    },
    new: {
      label: 'Step 2 of 3 — New PIN',
      subtitle: 'Enter your new 4-digit PIN',
      value: newPin,
      onChange: handleNewPinChange,
    },
    confirm: {
      label: 'Step 3 of 3 — Confirm New PIN',
      subtitle: 'Re-enter your new PIN to confirm',
      value: confirmPin,
      onChange: handleConfirmPinChange,
    },
  };

  const stepIndex = { current: 0, new: 1, confirm: 2 }[step];
  const config = stepConfig[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-purple-100 flex items-center justify-center">
            <KeyRound className="h-6 w-6 text-[#920793]" />
          </div>
          <h2 className="text-[17px] font-bold text-gray-900">Change PIN</h2>
          <p className="text-[12px] text-gray-500 mt-1">Update your 4-digit security PIN.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 pt-4 px-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 w-12 rounded-full transition-colors ${i <= stepIndex ? 'bg-[#920793]' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <p className="text-center text-[11px] text-gray-400 mt-1.5 mb-1">{config.label}</p>
        <p className="text-center text-[12px] text-gray-500 mb-1">{config.subtitle}</p>

        {/* Body */}
        <div className="px-6 py-5">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-[14px] font-semibold text-gray-800">PIN changed successfully!</p>
            </div>
          ) : (
            <>
              <PinPad
                value={config.value}
                onChange={config.onChange}
                disabled={isSubmitting}
                error=""
              />

              {error && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                  <p className="text-[12px] text-red-600">{error}</p>
                </div>
              )}

              {isSubmitting && (
                <p className="text-center text-[12px] text-gray-400 mt-3">Updating PIN…</p>
              )}
            </>
          )}
        </div>

        {/* Cancel */}
        {!success && (
          <div className="px-6 pb-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-[12px] text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
