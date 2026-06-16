'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, CheckCircle2 } from 'lucide-react';
import { usePinStore } from '@src/modules/pin/store/pin.store';
import { PinPad } from '@src/components/ui/PinPad';

type Mode = 'menu' | 'set' | 'change' | 'success';
type ChangeStep = 'verify_current' | 'enter_new' | 'confirm_new';

const PIN_LENGTH = 4;

const STEP_LABELS: Record<ChangeStep, { title: string; subtitle: string }> = {
  verify_current: { title: 'Enter Current PIN',  subtitle: 'Enter your existing 4-digit PIN to continue.' },
  enter_new:      { title: 'Enter New PIN',       subtitle: 'Choose a new 4-digit PIN.' },
  confirm_new:    { title: 'Confirm New PIN',     subtitle: 'Re-enter your new PIN to confirm.' },
};

function SetPinFlow({ isChange, onSuccess, onCancel }: { isChange: boolean; onSuccess: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<ChangeStep>(isChange ? 'verify_current' : 'enter_new');
  const [pins, setPins] = useState({ current: '', new: '', confirm: '' });
  const [error, setError] = useState('');

  const activeKey = step === 'verify_current' ? 'current' : step === 'enter_new' ? 'new' : 'confirm';
  const activePin = pins[activeKey];

  function handleChange(val: string) {
    setPins((p) => ({ ...p, [activeKey]: val }));
    if (error) setError('');
  }

  function handleNext() {
    if (activePin.length < PIN_LENGTH) return;

    if (step === 'verify_current') {
      // TODO: verify against real API
      setStep('enter_new');
      setPins((p) => ({ ...p, current: '' }));
    } else if (step === 'enter_new') {
      setStep('confirm_new');
      setPins((p) => ({ ...p, new: activePin, confirm: '' }));
    } else {
      if (pins.confirm !== pins.new) {
        setError('PINs do not match. Please try again.');
        setPins((p) => ({ ...p, confirm: '' }));
        return;
      }
      onSuccess();
    }
  }

  const { title, subtitle } = STEP_LABELS[step];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[16px] font-bold text-gray-900">{title}</p>
        <p className="text-[13px] text-gray-500 mt-1">{subtitle}</p>
      </div>

      <PinPad value={activePin} onChange={handleChange} error={error} />

      <button
        onClick={handleNext}
        disabled={activePin.length < PIN_LENGTH}
        className="w-full h-11 rounded-xl text-white text-[14px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        style={{ backgroundColor: '#920793' }}
      >
        {step === 'confirm_new' ? 'Save PIN' : 'Continue'}
      </button>

      <button onClick={onCancel} className="w-full text-center text-[13px] text-gray-400 hover:text-gray-600 transition-colors">
        Cancel
      </button>
    </div>
  );
}

export function PinSettingsView() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('menu');
  const tokenExpiry = usePinStore((s) => s.tokenExpiry);

  const tokenValid = tokenExpiry ? Date.now() < tokenExpiry : false;
  const tokenMinutes = tokenValid && tokenExpiry ? Math.ceil((tokenExpiry - Date.now()) / 60000) : 0;

  if (mode === 'set' || mode === 'change') {
    return (
      <div className="space-y-4">
        <button onClick={() => setMode('menu')} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SetPinFlow isChange={mode === 'change'} onSuccess={() => setMode('success')} onCancel={() => setMode('menu')} />
        </div>
      </div>
    );
  }

  if (mode === 'success') {
    return (
      <div className="space-y-4">
        <button onClick={() => router.push('/settings')} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Settings
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <div>
            <p className="text-[18px] font-black text-gray-900">PIN Updated!</p>
            <p className="text-[13px] text-gray-500 mt-1">Your verification PIN has been set successfully.</p>
          </div>
          <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
            <p className="text-[12px] text-[#920793]">Your PIN session is now active for 20 minutes.</p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="w-full h-11 rounded-xl text-white text-[14px] font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#920793' }}
          >
            Back to Settings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div>
        <h1 className="text-[22px] font-black text-gray-900">PIN Settings</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">Manage your verification PIN</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <Lock className="h-6 w-6 text-[#920793]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-gray-900">Verification PIN</p>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Your 4-digit PIN is required before sensitive actions like viewing balances, approving workflows, and submitting account openings.
            </p>
          </div>
        </div>
        {tokenValid && (
          <div className="mt-4 rounded-lg bg-green-50 border border-green-100 px-3 py-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-[12px] text-green-700 font-medium">
              PIN session active · expires in {tokenMinutes} {tokenMinutes === 1 ? 'minute' : 'minutes'}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => setMode('change')}
          className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <Lock className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-gray-900">Change PIN</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Update your current verification PIN</p>
          </div>
          <ArrowLeft className="h-4 w-4 text-gray-300 rotate-180 shrink-0" />
        </button>

        <div className="px-5 py-4">
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3">
            <p className="text-[12px] text-amber-700 font-medium">Default PIN</p>
            <p className="text-[12px] text-amber-600 mt-0.5">
              Your default PIN is <span className="font-bold">1234</span>. Change it immediately after first login for security.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">PIN Rules</p>
        </div>
        <div className="px-5 py-4 space-y-2">
          {[
            'PIN must be exactly 4 digits',
            'Do not share your PIN with anyone',
            'PIN session expires after 20 minutes',
            'Account locks after 3 failed attempts',
            'Change your PIN regularly for security',
          ].map((rule) => (
            <div key={rule} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-[#920793] shrink-0 mt-1.5" />
              <p className="text-[13px] text-gray-600">{rule}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
