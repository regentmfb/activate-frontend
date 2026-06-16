'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, RefreshCw } from 'lucide-react';
import { tier2Schema, Tier2SchemaValues } from '../../schema/account-opening.schema';
import { IndividualSavingsFormState } from '../../types/wizard.types';

type Props = { formState: IndividualSavingsFormState; onNext: (data: Partial<IndividualSavingsFormState>) => void; };

const input = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300`;
const label = `block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function Tier2UpgradeStep({ formState, onNext }: Props) {
  const [idCardPhotoUrl, setIdCardPhotoUrl] = useState<string | null>(formState.idCardPhotoUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const secondaryMethod = formState.verificationMethod === 'BVN' ? 'NIN' : 'BVN';

  const { register, handleSubmit, formState: { errors } } = useForm<Tier2SchemaValues>({
    resolver: zodResolver(tier2Schema),
    defaultValues: { secondaryIdMethod: secondaryMethod, secondaryIdValue: formState.secondaryIdValue },
  });

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setIdCardPhotoUrl(URL.createObjectURL(file));
  }

  function onSubmit(data: Tier2SchemaValues) {
    if (!idCardPhotoUrl) return;
    onNext({ secondaryIdMethod: data.secondaryIdMethod, secondaryIdValue: data.secondaryIdValue, idCardPhotoUrl });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Tier 2 Upgrade</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Provide the customer&apos;s {secondaryMethod} and a photo of their official ID card.</p>
      </div>

      <div className="space-y-1">
        <input type="hidden" {...register('secondaryIdMethod')} />
        <label className={label}>{secondaryMethod} Number</label>
        <input type="tel" inputMode="numeric" maxLength={11} placeholder="Enter 11-digit number"
          className={`${input} ${errors.secondaryIdValue ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
          {...register('secondaryIdValue')} />
        {errors.secondaryIdValue && <p className="text-[12px] text-red-500">{errors.secondaryIdValue.message}</p>}
      </div>

      <div className="space-y-1">
        <label className={label}>ID Card Photo</label>
        <p className="text-[11px] text-gray-400 mb-1.5">Only official government-issued IDs accepted.</p>
        {idCardPhotoUrl ? (
          <div className="relative">
            <img src={idCardPhotoUrl} alt="ID Card" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
            <button type="button" onClick={() => { setIdCardPhotoUrl(null); if (inputRef.current) inputRef.current.value = ''; }}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center">
              <RefreshCw className="h-3 w-3 text-gray-500" />
            </button>
          </div>
        ) : (
          <div onClick={() => inputRef.current?.click()}
            className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#920793] hover:bg-purple-50 transition-all">
            <Camera className="h-6 w-6 text-gray-300" />
            <p className="text-[12px] text-gray-400">Tap to capture ID card</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleCapture} />
      </div>

      <button type="submit" disabled={!idCardPhotoUrl} className={btn}>Continue to Tier 3</button>
    </form>
  );
}
