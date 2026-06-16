'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { IndividualSavingsFormState, Biodata } from '../../types/wizard.types';
import { useConfirmBiodata, useVerificationSession } from '@src/modules/identity/hooks/useIdentityVerification';
import { appToast } from '@src/lib/toast';

type Props = {
  formState: IndividualSavingsFormState;
  isManualMode: boolean;
  onNext: (data: Partial<IndividualSavingsFormState>) => void;
};

const field = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border border-gray-200 outline-none focus:border-[#920793] transition-colors`;
const readonlyField = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-100 border border-gray-200 outline-none cursor-default`;
const label = `block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function BiodataConfirmationStep({ formState, isManualMode, onNext }: Props) {
  const { mutate: confirmBiodata, isPending } = useConfirmBiodata();

  // Fetch the session to get verifiedFields populated by the backend after OTP
  const { data: session, isLoading: isSessionLoading } = useVerificationSession(
    formState.verificationId ?? '',
    { enabled: !!formState.verificationId && !isManualMode }
  );

  const verifiedFields = session?.verifiedFields;

  const { register, handleSubmit, reset } = useForm<Biodata & { email: string }>({
    defaultValues: {
      ...(formState.biodata ?? {}),
      email: formState.biodata?.email ?? '',
    },
  });

  // Once session loads with verifiedFields, populate the form
  useEffect(() => {
    if (!verifiedFields) return;
    reset({
      firstName: verifiedFields.firstName ?? '',
      lastName: verifiedFields.lastName ?? '',
      middleName: verifiedFields.middleName ?? '',
      dob: verifiedFields.dateOfBirth ?? '',
      gender: verifiedFields.gender ?? '',
      phone: verifiedFields.phoneNumber ?? '',
      email: verifiedFields.email ?? formState.biodata?.email ?? '',
      address: verifiedFields.address ?? '',
    });
  }, [verifiedFields, reset]);

  function onSubmit(data: Biodata & { email: string }) {
    const biodata: Biodata = { ...data };

    if (!formState.verificationId || isManualMode) {
      onNext({ biodata });
      return;
    }

    confirmBiodata(
      { verificationId: formState.verificationId, email: data.email || undefined },
      {
        onSuccess: (updatedSession) => {
          const fields = updatedSession.verifiedFields;
          onNext({
            biodata: fields ? {
              firstName: fields.firstName,
              lastName: fields.lastName,
              middleName: fields.middleName,
              dob: fields.dateOfBirth,
              gender: fields.gender,
              phone: fields.phoneNumber,
              email: fields.email,
              address: fields.address,
            } : biodata,
          });
        },
        onError: (err) => appToast.error(err.message),
      }
    );
  }

  if (isSessionLoading && !isManualMode) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10">
        <svg className="animate-spin h-6 w-6 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
        <p className="text-[13px] text-gray-500">Loading customer details…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">
          {isManualMode ? 'Enter Customer Biodata' : 'Confirm Customer Biodata'}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {isManualMode
            ? 'Fill in details manually. Account will be pending Operations review.'
            : 'Confirm the details below with the customer before proceeding.'}
        </p>
      </div>

      {isManualMode && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[12px] text-amber-700 font-medium">Manual mode — requires Operations approval within 24 hours.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>
            First Name
            {verifiedFields?.firstName && (
              <span className="ml-1 text-[9px] font-semibold text-green-600 uppercase">Verified</span>
            )}
          </label>
          <input 
            className={verifiedFields?.firstName ? readonlyField : (isManualMode ? field : readonlyField)} 
            {...register('firstName')} 
            readOnly={!!verifiedFields?.firstName || !isManualMode} 
          />
        </div>
        <div>
          <label className={label}>
            Last Name
            {verifiedFields?.lastName && (
              <span className="ml-1 text-[9px] font-semibold text-green-600 uppercase">Verified</span>
            )}
          </label>
          <input 
            className={verifiedFields?.lastName ? readonlyField : (isManualMode ? field : readonlyField)} 
            {...register('lastName')} 
            readOnly={!!verifiedFields?.lastName || !isManualMode} 
          />
        </div>
        <div>
          <label className={label}>Middle Name</label>
          <input className={isManualMode ? field : readonlyField} {...register('middleName')} readOnly={!isManualMode} />
        </div>
        <div>
          <label className={label}>Date of Birth</label>
          <input type="date" className={isManualMode ? field : readonlyField} {...register('dob')} readOnly={!isManualMode} />
        </div>
        <div>
          <label className={label}>Gender</label>
          <input className={isManualMode ? field : readonlyField} {...register('gender')} readOnly={!isManualMode} />
        </div>
        <div>
          <label className={label}>Phone</label>
          <input type="tel" className={isManualMode ? field : readonlyField} {...register('phone')} readOnly={!isManualMode} />
        </div>
        <div className="col-span-2">
          <label className={label}>Email (optional)</label>
          <input type="email" className={field} {...register('email')} />
        </div>
      </div>

      <button type="submit" disabled={isPending} className={btn}>
        {isPending ? 'Confirming…' : isManualMode ? 'Submit & Continue' : 'Confirm & Continue'}
      </button>
    </form>
  );
}
