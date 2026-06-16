'use client';

import { useState, useEffect } from 'react';
import { X, Lock } from 'lucide-react';
import { usePinStore } from '../store/pin.store';
import { securityApi } from '../api/security.api';
import { PinVerificationReason } from '../types/pin.types';
import { PinPad } from '@src/components/ui/PinPad';
import { PIN_REASON_MESSAGES } from '@src/constants/labels';

const REASON_MESSAGES = PIN_REASON_MESSAGES;

const PIN_LENGTH = 4;
const MAX_ATTEMPTS = 3;

export function PinVerificationModal() {
  const { isOpen, reason, onSuccess, onCancel, close, setRevealToken } = usePinStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setPin('');
        setError('');
        setAttempts(0);
        setIsLocked(false);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !isLocked && !isVerifying) {
      handleVerify(pin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  async function handleVerify(currentPin: string) {
    setIsVerifying(true);
    setError('');
    try {
      const token = await securityApi.getRevealToken(currentPin);
      setRevealToken(token);
      onSuccess?.();
      close();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Incorrect PIN.';
      const next = attempts + 1;
      setAttempts(next);
      if (next >= MAX_ATTEMPTS) {
        setIsLocked(true);
        setError('Too many failed attempts. Action locked.');
      } else {
        setError(`${message} ${MAX_ATTEMPTS - next} attempt(s) remaining.`);
      }
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }

  function handleCancel() {
    onCancel?.();
    close();
  }

  function handleChange(val: string) {
    if (isLocked || isVerifying) return;
    setPin(val);
    if (error) setError('');
  }

  if (!isOpen || !reason) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Lock className="h-5 w-5 text-[#920793]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-gray-900">Verify Your PIN</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">{REASON_MESSAGES[reason]}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>

        <div className="px-6 py-6">
          <PinPad
            value={pin}
            onChange={handleChange}
            disabled={isLocked || isVerifying}
            error={error}
          />
          {isVerifying && (
            <p className="text-center text-[12px] text-gray-400 mt-4">Verifying…</p>
          )}
        </div>
      </div>
    </div>
  );
}
