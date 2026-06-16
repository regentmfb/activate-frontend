'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { identitySchema, IdentitySchemaValues } from '../../schema/account-opening.schema';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useStartVerification } from '@src/modules/identity/hooks/useIdentityVerification';
import { useCheckExistence } from '../../hooks/useAccountOpening';
import { appToast } from '@src/lib/toast';
import { cn } from '@src/utils';

type Props = {
  formState: IndividualSavingsFormState;
  onNext: (data: Partial<IndividualSavingsFormState>) => void;
  accountType?: 'SAVINGS' | 'CURRENT';
};

const input = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border outline-none transition-colors placeholder:text-gray-300`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2`;

export function IdentityInputStep({ formState, onNext, accountType }: Props) {
  const { mutate: startVerification, isPending: isStartingVerification } = useStartVerification();
  const { mutate: checkExistence, isPending: isCheckingExistence } = useCheckExistence();

  const isPending = isStartingVerification || isCheckingExistence;

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IdentitySchemaValues>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      verificationMethod: (formState.verificationMethod === 'MANUAL' || formState.verificationMethod === 'FACE' ? 'BVN' : formState.verificationMethod) as 'BVN' | 'NIN',
      firstName: '',
      lastName: '',
      identityValue: formState.identityValue,
    },
  });

  const method = watch('verificationMethod');

  function onSubmit(data: IdentitySchemaValues) {
    checkExistence(
      {
        identifier: data.identityValue,
        accountType: accountType || 'SAVINGS',
      },
      {
        onSuccess: (existRes) => {
          if (existRes.exists) {
            appToast.error(existRes.message || 'An account of this type already exists or is in progress for this customer.');
            return;
          }

          startVerification(
            {
              type: data.verificationMethod,
              identifier: data.identityValue,
              firstName: data.firstName,
              lastName: data.lastName,
            },
            {
              onSuccess: (res) => {
                if (res.status === 'FAILED') {
                  appToast.error(res.message || 'Verification failed. Please check the BVN/NIN and name, then try again.');
                  return;
                }
                onNext({
                  verificationMethod: data.verificationMethod,
                  firstName: data.firstName,
                  lastName: data.lastName,
                  identityValue: data.identityValue,
                  verificationId: res.verificationId,
                });
              },
              onError: (err) => {
                appToast.error(err.message);
              },
            }
          );
        },
        onError: (err) => {
          appToast.error(err.message || 'Failed to check account existence.');
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Customer Identity</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Choose a verification method to begin.</p>
      </div>

      {/* Method selector */}
      <div className="flex gap-2">
        {(['BVN', 'NIN'] as const).map((m) => (
          <label
            key={m}
            className={cn(
              'flex-1 flex items-center justify-center h-9 rounded-lg border-2 cursor-pointer font-semibold text-[13px] transition-all',
              method === m ? 'border-[#920793] bg-purple-50 text-[#920793]' : 'border-gray-200 text-gray-400'
            )}
          >
            <input type="radio" value={m} {...register('verificationMethod')} className="sr-only" />
            {m}
          </label>
        ))}
      </div>

      {/* BVN / NIN input */}
      <div className="space-y-1">
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{method} Number</label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={11}
          placeholder="Enter 11-digit number"
          className={`${input} ${errors.identityValue ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
          {...register('identityValue')}
        />
        {errors.identityValue && <p className="text-[12px] text-red-500">{errors.identityValue.message}</p>}
      </div>

      {/* Customer name */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">First Name</label>
          <input
            type="text"
            placeholder="e.g. John"
            className={`${input} ${errors.firstName ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
            {...register('firstName')}
          />
          {errors.firstName && <p className="text-[12px] text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Last Name</label>
          <input
            type="text"
            placeholder="e.g. Doe"
            className={`${input} ${errors.lastName ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`}
            {...register('lastName')}
          />
          {errors.lastName && <p className="text-[12px] text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <button type="submit" disabled={isPending} className={btn}>
        {isPending ? 'Starting verification…' : 'Continue'}
      </button>
    </form>
  );
}
