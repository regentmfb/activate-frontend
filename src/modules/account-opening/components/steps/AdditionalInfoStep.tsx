'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { additionalInfoSchema, AdditionalInfoSchemaValues } from '../../schema/account-opening.schema';
import { IndividualCurrentFormState } from '../../types/wizard.types';
import { Upload } from 'lucide-react';

type Props = {
  formState: IndividualCurrentFormState;
  onNext: (data: Partial<IndividualCurrentFormState>) => void;
};

const input = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300`;
const label = `block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function AdditionalInfoStep({ formState, onNext }: Props) {
  const secondaryMethod = formState.verificationMethod === 'BVN' ? 'NIN' : 'BVN';
  const [signatureFile, setSignatureFile] = useState<File | null>(formState.signatureFile);
  const [bvnNinEvidenceFile, setBvnNinEvidenceFile] = useState<File | null>(formState.bvnNinEvidenceFile);

  const { register, handleSubmit, formState: { errors } } = useForm<AdditionalInfoSchemaValues>({
    resolver: zodResolver(additionalInfoSchema),
    defaultValues: {
      email: formState.email,
      secondPhone: formState.secondPhone,
      secondaryIdMethod: secondaryMethod,
      secondaryIdValue: formState.secondaryIdValue,
      address: formState.address,
    },
  });

  function onSubmit(data: AdditionalInfoSchemaValues) {
    if (!signatureFile || !bvnNinEvidenceFile) return;
    onNext({
      email: data.email,
      secondPhone: data.secondPhone,
      secondaryIdMethod: data.secondaryIdMethod as 'BVN' | 'NIN',
      secondaryIdValue: data.secondaryIdValue,
      address: data.address,
      signatureFile,
      bvnNinEvidenceFile,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Additional Information</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Fill in the remaining customer details required for a current account.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={label}>Email Address</label>
          <input type="email" placeholder="customer@email.com"
            className={`${input} ${errors.email ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
            {...register('email')} />
          {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={label}>Second Phone Number (optional)</label>
          <input type="tel" inputMode="numeric" maxLength={11} placeholder="08012345678"
            className={`${input} ${errors.secondPhone ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
            {...register('secondPhone')} />
          {errors.secondPhone && <p className="text-[12px] text-red-500 mt-1">{errors.secondPhone.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={label}>{secondaryMethod} Number</label>
          <input type="hidden" {...register('secondaryIdMethod')} />
          <input type="tel" inputMode="numeric" maxLength={11} placeholder="Enter 11-digit number"
            className={`${input} ${errors.secondaryIdValue ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
            {...register('secondaryIdValue')} />
          {errors.secondaryIdValue && <p className="text-[12px] text-red-500 mt-1">{errors.secondaryIdValue.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={label}>Residential Address</label>
          <input placeholder="Enter full residential address"
            className={`${input} ${errors.address ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
            {...register('address')} />
          {errors.address && <p className="text-[12px] text-red-500 mt-1">{errors.address.message}</p>}
        </div>

        {/* Signature Upload */}
        <div className="col-span-2 space-y-1">
          <label className={label}>Signature Image (Required)</label>
          <div className="relative flex items-center justify-between border border-dashed border-gray-300 rounded-lg p-3 hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-gray-400" />
              <span className="text-[12px] text-gray-600">
                {signatureFile ? signatureFile.name : 'Upload signature image (JPEG, PNG)'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSignatureFile(file);
              }}
            />
          </div>
        </div>

        {/* BVN/NIN Evidence Upload */}
        <div className="col-span-2 space-y-1">
          <label className={label}>BVN/NIN Verification Evidence (Required)</label>
          <div className="relative flex items-center justify-between border border-dashed border-gray-300 rounded-lg p-3 hover:bg-purple-50 transition-colors">
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-gray-400" />
              <span className="text-[12px] text-gray-600">
                {bvnNinEvidenceFile ? bvnNinEvidenceFile.name : 'Upload PDF or image evidence'}
              </span>
            </div>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setBvnNinEvidenceFile(file);
              }}
            />
          </div>
        </div>
      </div>

      <button type="submit" disabled={!signatureFile || !bvnNinEvidenceFile} className={btn}>Continue</button>
    </form>
  );
}
