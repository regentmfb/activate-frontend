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
  setStepMessage?: (msg: { type: 'success' | 'error' | 'info'; title: string; description: string }) => void;
};

const input = `w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-white border outline-none transition-colors placeholder:text-gray-300`;
const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2`;

export function IdentityInputStep({ formState, onNext, accountType, setStepMessage }: Props) {
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
            if (setStepMessage) {
              setStepMessage({
                type: 'error',
                title: 'Account Already Exists',
                description: 'This customer already has an account of this type. Please check the customer directory to manage it, or start over with a different BVN.',
              });
            } else {
              appToast.error(existRes.message || 'An account of this type already exists or is in progress for this customer.');
            }
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
                  if (setStepMessage) {
                    setStepMessage({
                      type: 'error',
                      title: 'Identity Not Found',
                      description: 'We could not find a match for this BVN. Please double-check the 11-digit number with the customer and try again.',
                    });
                  } else {
                    appToast.error(res.message || 'Verification failed. Please check the BVN/NIN and name, then try again.');
                  }
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
                if (setStepMessage) {
                  setStepMessage({
                    type: 'error',
                    title: 'Connection Issue',
                    description: 'We had trouble securely connecting to the verification service. Please check your internet connection and try again in a moment.',
                  });
                } else {
                  appToast.error(err.message);
                }
              },
            }
          );
        },
        onError: (err) => {
          if (setStepMessage) {
            setStepMessage({
              type: 'error',
              title: 'Verification Error',
              description: 'We were unable to verify if the customer already has an account. Please refresh the page or try again in a few minutes.',
            });
          } else {
            appToast.error(err.message || 'Failed to check account existence.');
          }
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

      {/* Method selector removed - forced to BVN */}
      <input type="hidden" value="BVN" {...register('verificationMethod')} />

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
      {/* 
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
      */}

      <button type="submit" disabled={isPending} className={btn}>
        {isPending ? 'Starting verification…' : 'Save and Continue'}
      </button>
    </form>
  );
}
