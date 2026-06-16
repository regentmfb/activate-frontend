'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Shield } from 'lucide-react';
import { useSubmitLienRequest } from '../hooks/useLien';
import type { LienFormData } from '../types/lien.types';

type Props = {
  accountNumber?: string;
  accountId?: string;
  customerId?: string;
  onSuccess?: () => void;
};

const input = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function LienRequestForm({ accountNumber, accountId, customerId, onSuccess }: Props) {
  const { mutate: submitRequest, isPending } = useSubmitLienRequest();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LienFormData>({
    defaultValues: { accountNumber: accountNumber ?? '', amount: '', reason: '' },
  });

  function onSubmit(data: LienFormData) {
    const amount = parseFloat(data.amount.replace(/,/g, ''));
    if (isNaN(amount) || amount <= 0) return;

    submitRequest(
      {
        accountId: accountId || data.accountNumber,
        customerId: customerId || '',
        amount,
        reason: data.reason,
        supportingDocuments: [],
      },
      {
        onSuccess: () => {
          reset({ accountNumber: accountNumber ?? '', amount: '', reason: '' });
          onSuccess?.();
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
          <Shield className="h-4 w-4 text-[#920793]" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-gray-900">Request Lien Placement</p>
          <p className="text-[12px] text-gray-500">Your request will be reviewed by Team Lead, then CMO, then Operations.</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Account Number</label>
        <input
          type="text"
          placeholder="e.g. 0012345678"
          className={`${input} ${errors.accountNumber ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
          readOnly={!!accountNumber}
          {...register('accountNumber', { required: 'Account number is required' })}
        />
        {errors.accountNumber && <p className="text-[12px] text-red-500">{errors.accountNumber.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Amount (₦)</label>
        <input
          type="text"
          inputMode="decimal"
          placeholder="e.g. 50000"
          className={`${input} ${errors.amount ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
          {...register('amount', {
            required: 'Amount is required',
            validate: (v) => {
              const n = parseFloat(v.replace(/,/g, ''));
              return (!isNaN(n) && n > 0) || 'Enter a valid positive amount';
            },
          })}
        />
        {errors.amount && <p className="text-[12px] text-red-500">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Reason</label>
        <textarea
          rows={3}
          placeholder="State the reason for placing this lien…"
          className={`w-full px-3 py-2 rounded-lg text-[13px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300 resize-none ${errors.reason ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
          {...register('reason', { required: 'Reason is required', minLength: { value: 10, message: 'Provide a more detailed reason (min 10 chars)' } })}
        />
        {errors.reason && <p className="text-[12px] text-red-500">{errors.reason.message}</p>}
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
        <p className="text-[12px] text-amber-700">
          This request will be sent to your <span className="font-semibold">Team Lead</span> for approval, then escalated to the <span className="font-semibold">CMO</span>, and finally executed by <span className="font-semibold">Operations</span>.
        </p>
      </div>

      <button type="submit" disabled={isPending} className={btn}>
        {isPending ? 'Submitting…' : 'Submit Lien Request'}
      </button>
    </form>
  );
}
