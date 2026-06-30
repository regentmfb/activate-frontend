'use client';

import { useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { tier2Schema, Tier2SchemaValues } from '../../schema/account-opening.schema';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useVerifyNin } from '../../../identity/hooks/useIdentityVerification';
import { NativeSelect, NativeSelectOption } from '@src/components/ui/native-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@src/components/ui/dialog';
import { appToast } from '@src/lib/toast';

type Props = { formState: IndividualSavingsFormState; onNext: (data: Partial<IndividualSavingsFormState>) => void; };

const input = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-white border outline-none transition-colors placeholder:text-gray-300`;
const label = `block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function Tier2UpgradeStep({ formState, onNext }: Props) {
  const [idCardPhotoUrl, setIdCardPhotoUrl] = useState<string | null>(formState.idCardPhotoUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: verifyNin, isPending: isVerifying } = useVerifyNin();

  const { register, handleSubmit, setError, clearErrors, watch, formState: { errors } } = useForm<Tier2SchemaValues>({
    resolver: zodResolver(tier2Schema),
    defaultValues: { secondaryIdMethod: 'NIN', secondaryIdValue: formState.secondaryIdValue },
  });

  const selectedMethod = watch('secondaryIdMethod');
  const secondaryIdValue = watch('secondaryIdValue');
  const [isNinVerified, setIsNinVerified] = useState(false);
  const [lastVerifiedNin, setLastVerifiedNin] = useState<string | null>(null);
  const [ninBiodata, setNinBiodata] = useState<any>(null);

  useEffect(() => {
    if (selectedMethod === 'NIN' && secondaryIdValue?.length === 11 && secondaryIdValue !== lastVerifiedNin && !isVerifying) {
      verifyNin(
        { nin: secondaryIdValue || '', verificationId: formState.accountRequestId || formState.clientReference || '' },
        {
          onSuccess: (result: any) => {
            const biodata = result?.data || result?.identity || result;
            setNinBiodata(biodata);
          },
          onError: (err: any) => {
            setIsNinVerified(false);
            setLastVerifiedNin(null);
            setError('secondaryIdValue', {
              type: 'manual',
              message: err.message || 'Verification failed. Please check the NIN.',
            });
          },
        }
      );
    } else if (selectedMethod === 'NIN' && secondaryIdValue !== lastVerifiedNin) {
      setIsNinVerified(false);
    }
  }, [secondaryIdValue, selectedMethod, lastVerifiedNin, verifyNin, formState.accountRequestId, formState.clientReference, clearErrors, setError, isVerifying]);

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setIdCardPhotoUrl(URL.createObjectURL(file));
  }

  function onSubmit(data: Tier2SchemaValues) {
    if (!idCardPhotoUrl) return;

    if (data.secondaryIdMethod === 'NIN' && !isNinVerified) {
      setError('secondaryIdValue', { type: 'manual', message: 'Please wait for NIN verification to complete.' });
      return;
    }

    onNext({ secondaryIdMethod: data.secondaryIdMethod, secondaryIdValue: data.secondaryIdValue || '', idCardPhotoUrl });
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Tier 2 Upgrade</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Select the customer's ID type and upload a photo of the document.</p>
      </div>

      <div className="space-y-1">
        <label className={label}>ID Type</label>
        <NativeSelect {...register('secondaryIdMethod')} className="w-full">
          <NativeSelectOption value="NIN">NIN</NativeSelectOption>
          <NativeSelectOption value="NATIONAL_ID">National ID</NativeSelectOption>
          <NativeSelectOption value="DRIVERS_LICENSE">Driver's Licence</NativeSelectOption>
          <NativeSelectOption value="PASSPORT">Passport</NativeSelectOption>
          <NativeSelectOption value="VOTERS_ID">Voter's Card</NativeSelectOption>
        </NativeSelect>
        {errors.secondaryIdMethod && <p className="text-[12px] text-red-500">{errors.secondaryIdMethod.message}</p>}
      </div>

      {selectedMethod === 'NIN' && (
        <div className="space-y-1">
          <label className={label}>NIN Number</label>
          <div className="relative">
            <input type="tel" inputMode="numeric" maxLength={11} placeholder="Enter 11-digit number"
              style={{ backgroundColor: 'white' }}
              className={`${input} ${errors.secondaryIdValue ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
              {...register('secondaryIdValue')} />
            {isVerifying && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            )}
            {isNinVerified && !isVerifying && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
          {errors.secondaryIdValue && <p className="text-[12px] text-red-500">{errors.secondaryIdValue.message}</p>}
          {isNinVerified && !errors.secondaryIdValue && <p className="text-[12px] text-green-600">NIN verified</p>}
        </div>
      )}

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
        <input ref={inputRef} type="file" accept="image/*"  className="sr-only" onChange={handleCapture} />
      </div>

      <button type="submit" disabled={!idCardPhotoUrl || (selectedMethod === 'NIN' && !isNinVerified)} className={`${btn} flex items-center justify-center`}>
        {isVerifying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying NIN...
          </>
        ) : (
          'Save and Continue'
        )}
      </button>
    </form>

      <Dialog open={!!ninBiodata} onOpenChange={(open) => {
        if (!open) {
          setNinBiodata(null);
          setLastVerifiedNin(secondaryIdValue || null);
        }
      }}>
        <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Identity</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-sm text-center text-gray-500">
              Please verify that this biodata matches the customer.
            </p>
            {(() => {
              const b = ninBiodata || {};
              const firstName = b.firstName || b.firstname || b.first_name || '';
              const lastName = b.lastName || b.lastname || b.last_name || '';
              const photo = b.base64Image || b.photo || b.profilePhotoBase64 || b.profilePhoto || '';
              const gender = b.gender || 'Unknown';
              const dob = b.dateOfBirth || b.dob || b.birthdate || 'Unknown';

              return (
                <div className="flex items-center gap-4 w-full bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {photo ? (
                    <img src={photo.startsWith('data:image') ? photo : `data:image/jpeg;base64,${photo}`} alt="NIN Photo" className="h-20 w-20 rounded-full object-cover shrink-0 border-2 border-white shadow-sm" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                      <span className="text-gray-400 text-xs">No Photo</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">
                      {firstName} {lastName}
                    </p>
                    <p className="text-[12px] text-gray-500">Gender: <span className="font-medium text-gray-700">{gender}</span></p>
                    <p className="text-[12px] text-gray-500">DOB: <span className="font-medium text-gray-700">{String(dob).split('T')[0]}</span></p>
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setNinBiodata(null);
                setLastVerifiedNin(secondaryIdValue || null);
                setIsNinVerified(false);
                setError('secondaryIdValue', {
                  type: 'manual',
                  message: 'Biodata rejected by user.',
                });
              }}
              className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              No, Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsNinVerified(true);
                setLastVerifiedNin(secondaryIdValue || null);
                clearErrors('secondaryIdValue');
                setNinBiodata(null);
              }}
              className="flex-1 h-10 rounded-xl text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity"
            >
              Yes, Confirm
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


