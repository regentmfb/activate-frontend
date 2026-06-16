'use client';

import { useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, ScanFace } from 'lucide-react';
import { IndividualSavingsFormState, Biodata } from '../../types/wizard.types';
import { usePictureVerification, useVerificationSession } from '@src/modules/identity/hooks/useIdentityVerification';
import { appToast } from '@src/lib/toast';

type Props = {
  formState: IndividualSavingsFormState;
  onSuccess: (biodata: Biodata, verificationId: string) => void;
  onFailed: () => void;
};

function mapVerifiedFields(fields: Record<string, string>): Biodata {
  return {
    firstName: fields.firstName ?? '',
    lastName: fields.lastName ?? '',
    middleName: fields.middleName,
    dob: fields.dateOfBirth ?? '',
    gender: fields.gender ?? '',
    phone: fields.phoneNumber ?? '',
    email: fields.email,
    address: fields.address,
  };
}

export function FaceProcessingStep({ formState, onSuccess, onFailed }: Props) {
  const submitted = useRef(false);
  const { mutate: submitPicture, isPending, data: submitResult, isError: submitFailed } = usePictureVerification();

  const verificationId = submitResult?.verificationId ?? formState.verificationId ?? '';
  const isProcessing = submitResult?.status === 'PROCESSING' || isPending;

  const { data: session } = useVerificationSession(verificationId, {
    enabled: !!verificationId && !submitFailed,
    refetchInterval: isProcessing ? 2000 : undefined,
  });

  // Submit picture once on mount
  useEffect(() => {
    if (submitted.current || !formState.customerPhotoUrl || !formState.verificationId) return;
    submitted.current = true;

    submitPicture(
      {
        verificationId: formState.verificationId,
        identifier: formState.identityValue,
        firstName: formState.biodata?.firstName || formState.firstName,
        lastName: formState.biodata?.lastName || formState.lastName,
        imageBase64: formState.customerPhotoUrl,
      },
      {
        onError: (err) => appToast.error(err.message),
      }
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // React to session status changes
  useEffect(() => {
    if (!session) return;
    if (session.status === 'BIODATA_RETRIEVED' || session.status === 'BIODATA_CONFIRMED') {
      if (session.verifiedFields) {
        onSuccess(mapVerifiedFields(session.verifiedFields as unknown as Record<string, string>), session.id);
      }
    } else if (session.status === 'FAILED') {
      onFailed();
    }
  }, [session?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = submitFailed ? 'failed'
    : session?.status === 'BIODATA_RETRIEVED' || session?.status === 'BIODATA_CONFIRMED' ? 'success'
    : session?.status === 'FAILED' ? 'failed'
    : 'matching';

  const biodata = session?.verifiedFields;

  return (
    <div className="flex flex-col items-center justify-center min-h-[340px] space-y-6 py-4">

      {formState.customerPhotoUrl ? (
        <div className="relative">
          <img src={formState.customerPhotoUrl} alt="Customer face"
            className="w-24 h-24 rounded-full object-cover border-[3px] transition-all"
            style={{ borderColor: status === 'success' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#920793' }}
          />
          {status === 'success' && (
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          )}
          {status === 'failed' && (
            <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-red-500 border-2 border-white flex items-center justify-center">
              <XCircle className="h-4 w-4 text-white" />
            </div>
          )}
          {status === 'matching' && (
            <div className="absolute inset-0 rounded-full border-[3px] border-transparent animate-spin"
              style={{ borderTopColor: '#920793', borderRightColor: '#920793' }} />
          )}
        </div>
      ) : (
        <div className="h-24 w-24 rounded-full bg-purple-50 flex items-center justify-center">
          <ScanFace className="h-10 w-10 text-[#920793]" />
        </div>
      )}

      {status === 'matching' && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[15px] font-bold text-gray-900">Face Matching</p>
          <p className="text-[13px] text-gray-500">Matching face against database…</p>
          <div className="flex gap-1.5 mt-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#920793', animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {status === 'success' && biodata && (
        <div className="flex flex-col items-center gap-1 w-full">
          <p className="text-[15px] font-bold text-gray-900">Match Found!</p>
          <p className="text-[13px] text-gray-500">{biodata.firstName} {biodata.lastName}</p>
          <div className="mt-3 w-full bg-green-50 border border-green-100 rounded-lg divide-y divide-green-100">
            {[
              ['Name', `${biodata.firstName} ${biodata.middleName ?? ''} ${biodata.lastName}`.trim()],
              ['Phone', biodata.phoneNumber],
              ['DOB', biodata.dateOfBirth],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-3 py-2 text-[12px]">
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-gray-800">{v}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onSuccess(mapVerifiedFields(biodata as unknown as Record<string, string>), verificationId)}
            className="mt-4 w-full h-10 rounded-xl text-white text-[13px] font-bold hover:opacity-90 transition-opacity"
            style={{ background: '#920793' }}
          >
            Confirm &amp; Continue
          </button>
        </div>
      )}

      {status === 'failed' && (
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-[15px] font-bold text-gray-900">No Match Found</p>
          <p className="text-[13px] text-gray-500 text-center">
            Could not match the face against the database. Please try again or use BVN/NIN.
          </p>
          <div className="flex gap-2 w-full mt-1">
            <button onClick={onFailed}
              className="flex-1 h-9 rounded-lg text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors">
              Use BVN / NIN
            </button>
            <button onClick={() => { submitted.current = false; }}
              className="flex-1 h-9 rounded-lg text-white text-[13px] font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#920793' }}>
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
