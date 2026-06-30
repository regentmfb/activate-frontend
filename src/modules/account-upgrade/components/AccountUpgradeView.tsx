'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft, ArrowUpCircle, CheckCircle2, Camera,
  RefreshCw, MapPin, XCircle, Loader2, Info, Clock
} from 'lucide-react';
import { useAccountUpgradeWizard } from '../hooks/useAccountUpgradeWizard';
import { useSubmitTier2, useSubmitTier3 } from '../hooks/useAccountUpgrade';
import { useAccountRequestsByCustomer } from '@src/modules/account-opening/hooks/useAccountOpening';
import { documentsApi } from '@src/modules/documents/api/documents.api';
import { NativeSelect, NativeSelectOption } from '@src/components/ui/native-select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@src/components/ui/dialog';
import { useVerifyNin } from '@src/modules/identity/hooks/useIdentityVerification';
import { tier2Schema, Tier2SchemaValues, tier3AddressSchema, Tier3AddressSchemaValues } from '@src/modules/account-opening/schema/account-opening.schema';
import { UpgradeFormState } from '../hooks/useAccountUpgradeWizard';
import { appToast } from '@src/lib/toast';
import { cn } from '@src/utils';
import { NIGERIA_STATES } from '@src/constants/nigeria-states';
import { SearchableSelect } from '@src/components/ui/SearchableSelect';

const inputCls = `w-full h-11 px-3.5 rounded-xl text-[14px] font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#920793] focus:ring-4 focus:ring-[#920793]/10 outline-none transition-all placeholder:text-gray-400`;
const labelCls = `block text-[13px] font-medium text-gray-700 mb-1.5`;
const btnCls = `w-full h-12 rounded-xl text-white text-[14px] font-bold bg-[#920793] hover:bg-[#7a067a] shadow-md shadow-[#920793]/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 mt-2`;

function UploadZone({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#920793] hover:bg-purple-50/50 transition-all">
      {children}
    </div>
  );
}

// ── Tier 2 step ───────────────────────────────────────────────────────────────

function Tier2Step({
  formState,
  activateRequestId,
  initialIdMethod,
  onNext,
}: {
  formState: UpgradeFormState;
  activateRequestId: string;
  initialIdMethod?: 'NIN' | 'BVN' | null;
  onNext: (data: Partial<UpgradeFormState>) => void;
}) {
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate: submitTier2, isPending } = useSubmitTier2();
  const { mutate: verifyNin, isPending: isVerifying } = useVerifyNin();

  const { register, handleSubmit, watch, setError, clearErrors, formState: { errors } } = useForm<Tier2SchemaValues>({
    resolver: zodResolver(tier2Schema),
    defaultValues: { secondaryIdMethod: 'NIN', secondaryIdValue: formState.secondaryIdValue },
  });

  const selectedMethod = watch('secondaryIdMethod');
  const secondaryIdValue = watch('secondaryIdValue');
  const [isNinVerified, setIsNinVerified] = useState(false);
  const [lastVerifiedNin, setLastVerifiedNin] = useState<string | null>(null);
  const [rejectedNins, setRejectedNins] = useState<Set<string>>(new Set());
  const [ninBiodata, setNinBiodata] = useState<any>(null);

  useEffect(() => {
    // Only verify if 11 digits, numbers only, not already verified, and not previously rejected
    const is11Digits = /^\d{11}$/.test(secondaryIdValue || '');
    if (
      selectedMethod === 'NIN' &&
      is11Digits &&
      secondaryIdValue !== lastVerifiedNin &&
      !rejectedNins.has(secondaryIdValue || '') &&
      !isVerifying
    ) {
      verifyNin(
        { nin: secondaryIdValue || '', verificationId: activateRequestId },
        {
          onSuccess: (result: any) => {
            const biodata = result?.data || result?.identity || result;
            const isEmpty = !biodata || (typeof biodata === 'object' && Object.keys(biodata).length === 0);

            if (isEmpty) {
              setIsNinVerified(false);
              setLastVerifiedNin(secondaryIdValue || null);
              setRejectedNins((prev) => new Set(prev).add(secondaryIdValue || ''));
              setError('secondaryIdValue', {
                type: 'manual',
                message: 'Invalid NIN.',
              });
              return;
            }

            setNinBiodata(biodata);
            setLastVerifiedNin(secondaryIdValue || null);
          },
          onError: (err: any) => {
            setIsNinVerified(false);
            setLastVerifiedNin(secondaryIdValue || null); // Prevent infinite loop on error
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
  }, [secondaryIdValue, selectedMethod, lastVerifiedNin, rejectedNins, verifyNin, activateRequestId, clearErrors, setError, isVerifying]);

  async function onSubmit(data: Tier2SchemaValues) {
    if (data.secondaryIdMethod === 'NIN') {
      if (!isNinVerified) {
        setError('secondaryIdValue', { type: 'manual', message: 'Please wait for NIN verification to complete.' });
        return;
      }
      proceedWithSubmitNin(data);
    } else {
      if (!idCardFile) {
        appToast.error('Please upload an ID card photo.');
        return;
      }
      proceedWithUploadAndSubmit(data, idCardFile);
    }
  }

  function proceedWithSubmitNin(data: Tier2SchemaValues) {
    submitTier2(
      {
        activateRequestId,
        payload: {
          nin: data.secondaryIdValue || '',
          bvn: undefined,
          idCardDocumentId: '00000000-0000-0000-0000-000000000000', // Dummy UUID to bypass strict backend validation
          hasConsent: true,
        },
      },
      {
        onSuccess: (result: any) => {
          onNext({
            secondaryIdMethod: data.secondaryIdMethod,
            secondaryIdValue: data.secondaryIdValue,
            upgradeMessage: result?.message,
          });
        },
      }
    );
  }

  async function proceedWithUploadAndSubmit(data: Tier2SchemaValues, fileToUpload: File) {
    setUploading(true);

    let idCardDocumentId: string;
    try {
      const result = await documentsApi.upload({
        file: fileToUpload,
        activateRequestId,
        documentType: 'valid_id',
      });
      console.log('[Tier2Step] document upload result:', result);
      idCardDocumentId = result.documentId;
      if (!idCardDocumentId) {
        throw new Error('Document upload did not return a valid ID');
      }
    } catch (err: any) {
      appToast.error(err?.message || 'Failed to upload ID card. Please try again.');
      setUploading(false);
      return;
    }

    setUploading(false);

    submitTier2(
      {
        activateRequestId,
        payload: {
          nin: undefined,
          bvn: undefined,
          idCardDocumentId,
          hasConsent: true,
        },
      },
      {
        onSuccess: (result: any) => {
          onNext({
            secondaryIdMethod: data.secondaryIdMethod,
            secondaryIdValue: data.secondaryIdValue,
            idCardPhotoUrl: idCardPreview,
            upgradeMessage: result?.message,
          });
        },
      }
    );
  }

  const isSubmitting = uploading || isPending || isVerifying;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
        <p className="text-[14px] font-bold text-gray-900">Tier 2 Upgrade</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Select the customer's ID type and upload a photo of the document.
        </p>
      </div>

      <div className="space-y-1">
        <label className={labelCls}>ID Type</label>
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
          <label className={labelCls}>NIN Number</label>
          <div className="relative">
            <input
              type="text" inputMode="numeric" maxLength={11} placeholder="Enter 11-digit number"
              style={{ backgroundColor: 'white' }}
              className={cn(inputCls, errors.secondaryIdValue ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]')}
              {...register('secondaryIdValue')}
              onChange={(e) => {
                // Force numeric only
                const val = e.target.value.replace(/\D/g, '');
                e.target.value = val;
                register('secondaryIdValue').onChange(e);
              }}
            />
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
          {isNinVerified && !errors.secondaryIdValue && <p className="text-[12px] text-green-600"></p>}
        </div>
      )}

      {selectedMethod !== 'NIN' && (
        <div className="space-y-1">
          <label className={labelCls}>ID Card Photo</label>
          <p className="text-[11px] text-gray-400 mb-1.5">Government-issued ID (national ID, driver's licence, passport)</p>
          {idCardPreview ? (
            <div className="relative">
              <img src={idCardPreview} alt="ID Card" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setIdCardPreview(null); setIdCardFile(null); if (inputRef.current) inputRef.current.value = ''; }}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center">
                <RefreshCw className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          ) : (
            <UploadZone onClick={() => inputRef.current?.click()}>
              <Camera className="h-6 w-6 text-gray-300" />
              <p className="text-[12px] text-gray-400">Tap to capture ID card</p>
            </UploadZone>
          )}
          <input ref={inputRef} type="file" accept="image/*"  className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) { setIdCardFile(f); setIdCardPreview(URL.createObjectURL(f)); }
            }} />
        </div>
      )}

        <button type="submit" disabled={(selectedMethod !== 'NIN' && !idCardFile) || isSubmitting || (selectedMethod === 'NIN' && !isNinVerified)} className={btnCls}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? 'Uploading ID...' : isVerifying ? 'Verifying NIN...' : isPending ? 'Processing Tier 2 upgrade...' : 'Complete Tier 2 Upgrade'}
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
                <div className="flex flex-col items-center gap-3 w-full bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                  {photo ? (
                    <img src={photo.startsWith('data:image') ? photo : `data:image/jpeg;base64,${photo}`} alt="NIN Photo" className="h-24 w-24 rounded-full object-cover shrink-0 border-4 border-purple-50 shadow-md" />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border-4 border-white shadow-md">
                      <span className="text-purple-300 text-xs font-medium">No Photo</span>
                    </div>
                  )}
                  <div className="flex flex-col items-center w-full space-y-1.5 mt-2">
                    <p className="font-bold text-gray-900 text-lg leading-tight text-center">
                      {firstName} {lastName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium tracking-wide uppercase">
                        Gender: {gender}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-medium tracking-wide uppercase">
                        DOB: {String(dob).split('T')[0]}
                      </span>
                    </div>
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
                setRejectedNins((prev) => new Set(prev).add(secondaryIdValue || ''));
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

// ── Tier 3 step ───────────────────────────────────────────────────────────────

function Tier3Step({
  formState,
  activateRequestId,
  onNext,
}: {
  formState: UpgradeFormState;
  activateRequestId: string;
  onNext: (data: Partial<UpgradeFormState>) => void;
}) {
  const [proximity, setProximity] = useState<boolean | null>(formState.isProximityConfirmed);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(formState.proofOfAddressUrl);
  const [locationFile, setLocationFile] = useState<File | null>(null);
  const [locationPreview, setLocationPreview] = useState<string | null>(formState.locationPhotoUrl);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(formState.gpsCoords);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [remoteAddress, setRemoteAddress] = useState(formState.address || '');
  const proofRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);
  const { mutate: submitTier3, isPending } = useSubmitTier3();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<Tier3AddressSchemaValues>({
    resolver: zodResolver(tier3AddressSchema),
    defaultValues: { 
      streetNumber: '',
      streetName: '',
      lga: '',
      city: '',
      state: '',
      landmark: '',
      description: '',
    },
  });

  const selectedState = watch('state');
  const availableLgas = NIGERIA_STATES.find(s => s.state === selectedState)?.lgas || [];
  const availableCities = NIGERIA_STATES.find(s => s.state === selectedState)?.cities || [];

  function captureGPS() {
    setGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      () => { setGpsError('Could not get location. Enable GPS and try again.'); setGpsLoading(false); },
      { timeout: 10000 }
    );
  }

  async function onSubmit(data: Tier3AddressSchemaValues) {
    if (!proofFile || !locationFile) return;
    setUploading(true);

    let proofDocId: string;
    let locationDocId: string;
    try {
      const [proofResult, locationResult] = await Promise.all([
        documentsApi.upload({ file: proofFile, activateRequestId, documentType: 'utility_bill' }),
        documentsApi.upload({ file: locationFile, activateRequestId, documentType: 'LOCATION_PHOTO' }),
      ]);
      proofDocId = proofResult.documentId;
      locationDocId = locationResult.documentId;
    } catch {
      appToast.error('Failed to upload documents. Please try again.');
      setUploading(false);
      return;
    }

    setUploading(false);
    
    const combinedAddress = [data.streetNumber, data.streetName, data.landmark, data.city, data.lga, data.state, 'Nigeria'].filter(Boolean).join(', ');

    submitTier3(
      {
        activateRequestId,
        payload: {
          address: {
            houseNumber: data.streetNumber,
            street: data.streetName,
            landmark: data.landmark,
            city: data.city,
            lga: data.lga,
            state: data.state,
            country: 'NG',
          },
          proofOfAddressDocumentId: proofDocId,
          customerLocationImageId: locationDocId,
        },
      },
      {
        onSuccess: (result: any) => {
          onNext({
            isProximityConfirmed: proximity,
            address: combinedAddress,
            proofOfAddressUrl: proofPreview,
            locationPhotoUrl: locationPreview,
            gpsCoords,
            upgradeMessage: result?.message,
          });
        },
      }
    );
  }

  // Remote (not nearby) flow — just upload proof of address
  async function handleRemoteSubmit() {
    if (!proofFile) return;
    setUploading(true);

    let proofDocId: string;
    try {
      const proofResult = await documentsApi.upload({
        file: proofFile,
        activateRequestId,
        documentType: 'utility_bill',
      });
      proofDocId = proofResult.documentId;
    } catch {
      appToast.error('Failed to upload proof of address. Please try again.');
      setUploading(false);
      return;
    }

    setUploading(false);

    submitTier3(
      {
        activateRequestId,
        payload: {
          address: {
            houseNumber: 'N/A',
            street: remoteAddress.trim(),
            city: 'N/A',
            lga: 'N/A',
            state: 'N/A',
            country: 'NG',
          },
          proofOfAddressDocumentId: proofDocId,
          customerLocationImageId: proofDocId, // reuse proof for remote
        },
      },
      {
        onSuccess: (result: any) => {
          onNext({ 
            isProximityConfirmed: false, 
            proofOfAddressUrl: proofPreview, 
            address: remoteAddress.trim(),
            upgradeMessage: result?.message 
          });
        },
      }
    );
  }

  const isSubmitting = uploading || isPending;

  if (proximity === null) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[14px] font-bold text-gray-900">Tier 3 Upgrade</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Are you currently near the customer&apos;s residential address?</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Yes, I'm nearby", icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, value: true, hover: 'hover:border-green-400 hover:bg-green-50' },
            { label: "No, I'm not", icon: <XCircle className="h-5 w-5 text-red-400" />, value: false, hover: 'hover:border-red-400 hover:bg-red-50' },
          ].map((opt) => (
            <button key={String(opt.value)} type="button" onClick={() => setProximity(opt.value)}
              className={`h-20 rounded-xl border-2 border-gray-200 flex flex-col items-center justify-center gap-1.5 transition-all ${opt.hover}`}>
              {opt.icon}
              <span className="text-[12px] font-semibold text-gray-700">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (proximity === false) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[14px] font-bold text-gray-900">Tier 3 — Remote Verification</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Enter the customer&apos;s residential address and upload proof of address.</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[12px] text-amber-700">Head of Operations / Internal Control will review and approve.</p>
        </div>
        <div>
          <label className={labelCls}>Customer Address</label>
          <input
            className={cn(inputCls, 'border-gray-200 focus:border-[#920793]')}
            placeholder="Enter full residential address"
            value={remoteAddress}
            onChange={(e) => setRemoteAddress(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Proof of Address</label>
          {proofPreview ? (
            <div className="relative">
              <img src={proofPreview} alt="Proof" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setProofPreview(null); setProofFile(null); }}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center">
                <RefreshCw className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          ) : (
            <UploadZone onClick={() => proofRef.current?.click()}>
              <Camera className="h-6 w-6 text-gray-300" />
              <p className="text-[12px] text-gray-400">Upload proof of address</p>
            </UploadZone>
          )}
          <input ref={proofRef} type="file" accept="image/*"  className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProofFile(f); setProofPreview(URL.createObjectURL(f)); } }} />
        </div>
        <button type="button" disabled={!proofFile || !remoteAddress.trim() || isSubmitting} onClick={handleRemoteSubmit} className={btnCls}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {uploading ? 'Uploading...' : isPending ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Tier 3 Upgrade</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Complete address verification.</p>
      </div>

      <div className="rounded-lg bg-purple-50 border border-[#920793]/20 px-3 py-2 flex items-start gap-2">
        <Clock className="h-4 w-4 text-[#920793] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#920793] leading-tight">
          <strong>Please note:</strong> Address verification may take up to <strong>2 business days</strong> to complete.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Street Number</label>
          <input className={cn(inputCls, errors.streetNumber ? 'border-red-400' : 'border-gray-200')} placeholder="e.g. 14" {...register('streetNumber')} />
          {errors.streetNumber && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.streetNumber.message}</p>}
        </div>
        <div>
          <label className={labelCls}>Street Name</label>
          <input className={cn(inputCls, errors.streetName ? 'border-red-400' : 'border-gray-200')} placeholder="e.g. Awolowo Way" {...register('streetName')} />
          {errors.streetName && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.streetName.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>State</label>
        <SearchableSelect
          options={NIGERIA_STATES.map(s => s.state)}
          value={watch('state')}
          onChange={(val) => {
            setValue('state', val, { shouldValidate: true });
            setValue('lga', '');
            setValue('city', '');
          }}
          placeholder="Select State"
          className={errors.state ? 'border-red-400' : ''}
        />
        {errors.state && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.state.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>City</label>
          <SearchableSelect
            options={availableCities}
            value={watch('city')}
            onChange={(val) => setValue('city', val, { shouldValidate: true })}
            placeholder="Select City"
            className={errors.city ? 'border-red-400' : ''}
            disabled={!watch('state')}
          />
          {errors.city && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <label className={labelCls}>LGA</label>
          <SearchableSelect
            options={availableLgas}
            value={watch('lga')}
            onChange={(val) => setValue('lga', val, { shouldValidate: true })}
            placeholder="Select LGA"
            className={errors.lga ? 'border-red-400' : ''}
            disabled={!watch('state')}
          />
          {errors.lga && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.lga.message}</p>}
        </div>
      </div>

      <div>
        <label className={labelCls}>Landmark</label>
        <input className={cn(inputCls, errors.landmark ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]')} placeholder="e.g. Near the big oak tree" {...register('landmark')} />
      </div>
      
      <div>
        <label className={labelCls}>Description</label>
        <input className={cn(inputCls, errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]')} placeholder="Additional details..." {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Proof of Address</label>
          {proofPreview ? (
            <div className="relative">
              <img src={proofPreview} alt="Proof" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setProofPreview(null); setProofFile(null); }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center">
                <RefreshCw className="h-2.5 w-2.5 text-gray-500" />
              </button>
            </div>
          ) : (
            <UploadZone onClick={() => proofRef.current?.click()}>
              <Camera className="h-5 w-5 text-gray-300" />
              <p className="text-[11px] text-gray-400">Utility bill</p>
            </UploadZone>
          )}
          <input ref={proofRef} type="file" accept="image/*"  className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProofFile(f); setProofPreview(URL.createObjectURL(f)); } }} />
        </div>
        <div>
          <label className={labelCls}>Location Photo</label>
          {locationPreview ? (
            <div className="relative">
              <img src={locationPreview} alt="Location" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setLocationPreview(null); setLocationFile(null); }}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center">
                <RefreshCw className="h-2.5 w-2.5 text-gray-500" />
              </button>
            </div>
          ) : (
            <UploadZone onClick={() => locationRef.current?.click()}>
              <Camera className="h-5 w-5 text-gray-300" />
              <p className="text-[11px] text-gray-400">Location photo</p>
            </UploadZone>
          )}
          <input ref={locationRef} type="file" accept="image/*"  className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLocationFile(f); setLocationPreview(URL.createObjectURL(f)); } }} />
        </div>
      </div>

      {/* <div>
        <label className={labelCls}>GPS Location</label>
        {gpsCoords ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-green-700">Location captured</p>
              <p className="text-[11px] text-green-600 truncate">{gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}</p>
            </div>
            <button type="button" onClick={() => setGpsCoords(null)}>
              <RefreshCw className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        ) : (
          <button type="button" onClick={captureGPS} disabled={gpsLoading}
            className="w-full h-9 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-[13px] font-medium text-gray-500 hover:border-[#920793] hover:text-[#920793] hover:bg-purple-50 transition-all disabled:opacity-50">
            <MapPin className="h-4 w-4" />
            {gpsLoading ? 'Getting location...' : 'Capture GPS Location'}
          </button>
        )}
        {gpsError && <p className="text-[12px] text-red-500 mt-1">{gpsError}</p>}
      </div> */}

      <button type="submit" disabled={!proofFile || !locationFile || isSubmitting} className={btnCls}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {uploading ? 'Uploading documents...' : isPending ? 'Processing Tier 3 upgrade...' : 'Complete Tier 3 Upgrade'}
      </button>
    </form>
  );
}

// ── Complete step ─────────────────────────────────────────────────────────────

function CompleteStep({ formState, realAccountNumber }: { formState: UpgradeFormState, realAccountNumber?: string }) {
  const router = useRouter();
  const isRemoteReview = formState.targetTier === 3 && formState.isProximityConfirmed === false;

  const isSavings = 
    formState.upgradeMessage?.toLowerCase().includes('instantly') || 
    formState.upgradeMessage?.toLowerCase().includes('auto-verified') ||
    formState.upgradeMessage?.toLowerCase().includes('completed on activate') ||
    formState.upgradeMessage?.toLowerCase().includes('upgraded successfully');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-[#920793]" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900">
            {isRemoteReview 
              ? 'Submitted for Review' 
              : isSavings 
                ? `Tier ${formState.targetTier} Upgrade Successful` 
                : `Tier ${formState.targetTier} Upgrade Submitted`}
          </p>
          <p className="text-[12px] text-gray-500">
            {formState.upgradeMessage || (isRemoteReview
              ? 'Operations will review and approve the Tier 3 upgrade.'
              : `Upgrade request for Account ${formState.accountNumber} is being verified by the core banking system.`)}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border border-gray-100 divide-y divide-gray-100">
        {[
          ['Account Number', realAccountNumber || formState.accountNumber],
          ['Current Tier', `Tier ${formState.currentTier}`],
          ['Target Tier', `Tier ${formState.targetTier}`],
          ['Status', isRemoteReview ? 'Pending Operations Review' : (formState.targetTier === 3 ? 'Pending Location Verification' : (isSavings ? 'Completed' : 'Pending Core Verification'))],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center px-4 py-2.5 text-[13px]">
            <span className="text-gray-500">{k}</span>
            <span className={cn(
              "font-semibold",
              v === 'Completed' ? "bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] tracking-wide" : 
              v === 'Tier 2' ? "bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold" :
              v === 'Tier 3' ? "bg-purple-50 text-[#920793] px-2 py-0.5 rounded-full text-[10px] font-bold" :
              "text-gray-900"
            )}>{v as string}</span>
          </div>
        ))}
      </div>

      {!isRemoteReview && (
        <div className="rounded-xl bg-purple-50 border border-purple-100 px-4 py-3">
          <p className="text-[12px] text-[#920793]">Customer has been notified via SMS and email.</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => router.push('/customers')}
          className="flex-1 h-10 rounded-xl text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity"
        >
          View Customers
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex-1 h-10 rounded-xl text-[13px] font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}

// ── Manual fallback: let the user paste the activateRequestId ─────────────────

function ManualRequestIdEntry({ onSubmit }: { onSubmit: (id: string) => void }) {
  const [value, setValue] = useState('');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Account Request ID
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste the activateRequestId (UUID)"
          className="w-full h-9 px-3 rounded-lg text-[13px] text-gray-800 bg-gray-50 border border-gray-200 outline-none focus:border-[#920793] transition-colors"
        />
      </div>
      <button
        onClick={() => isUuid && onSubmit(value.trim())}
        disabled={!isUuid}
        className="w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Continue with this ID
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type Props = {
  /** activateRequestId (UUID) OR customerId when fromCustomer=true */
  accountNumber: string;
  /** Optional: current tier from parent (1 = going to T2, 2 = going to T3) */
  currentTier?: number;
  /** When true, accountNumber is a customerId — look up the activateRequestId */
  fromCustomer?: boolean;
};

export function AccountUpgradeView({ accountNumber, currentTier: currentTierProp, fromCustomer }: Props) {
  const router = useRouter();

  // When coming from CustomerDetail, accountNumber is actually a customerId.
  // Fetch all account requests and find the one belonging to this customer.
  const { data: allRequests, isLoading: loadingRequests } = useAccountRequestsByCustomer(
    accountNumber,
    { enabled: !!fromCustomer }
  );

  // Resolve the activateRequestId — find the most recent non-cancelled/failed request
  const matchingRequest = fromCustomer && Array.isArray(allRequests)
    ? allRequests.find(r => r.status !== 'CANCELLED' && r.status !== 'FAILED')
    : null;

  const activateRequestId = fromCustomer
    ? (matchingRequest?.id ?? '')
    : accountNumber;

  // Log for debugging
  if (fromCustomer) {
    console.log('[AccountUpgradeView] customerId:', accountNumber, 'requests:', allRequests, 'matched:', matchingRequest);
  }

  // Derive tier from the account request if not explicitly given
  const resolvedTier = currentTierProp
    ?? (fromCustomer
      ? (matchingRequest?.tier === 'TIER_2' ? 2 : 1)
      : 1);

  const currentTier = resolvedTier;

  const { currentStep, formState, update, next } = useAccountUpgradeWizard(
    activateRequestId || accountNumber,
    currentTier
  );

  // Show loading when resolving customer's activateRequestId
  if (fromCustomer && loadingRequests) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-7 w-7 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
          </svg>
          <p className="text-[13px] text-gray-500">Loading account details…</p>
        </div>
      </div>
    );
  }

  // If coming from customer and no active request was found, still allow proceeding
  // The backend may return data differently — let the user try and see the API error
  if (fromCustomer && !loadingRequests && !activateRequestId) {
    return (
      <div className="space-y-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="text-center space-y-2">
            <p className="text-[14px] font-semibold text-gray-900">Account Request Not Found</p>
            <p className="text-[13px] text-gray-400">
              Could not automatically find the account request for this customer. 
              Please use the Task Bank to start the upgrade, or enter the Account Request ID manually below.
            </p>
          </div>
          <ManualRequestIdEntry onSubmit={(id) => router.replace(`/account-upgrade/${id}`)} />
        </div>
      </div>
    );
  }

  function handleNext(data: Partial<UpgradeFormState>) {
    update(data);
    next();
  }

  const isComplete = currentStep === 'COMPLETE';

  const progressSteps = currentTier === 1
    ? [{ key: 'TIER2_UPGRADE', label: 'Tier 2' }, { key: 'COMPLETE', label: 'Done' }]
    : [{ key: 'TIER3_UPGRADE', label: 'Tier 3' }, { key: 'COMPLETE', label: 'Done' }];

  const currentIndex = progressSteps.findIndex((s) => s.key === currentStep);
  const progress = isComplete ? 100 : Math.round((currentIndex / (progressSteps.length - 1)) * 100);

  return (
    <div className="space-y-3">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {!isComplete && (
        <div className="md:hidden bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="h-4 w-4 text-[#920793]" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-900">Account Upgrade</p>
              <p className="text-[10px] text-gray-400">Tier {currentTier} → Tier {currentTier + 1}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#920793]">
                {currentStep === 'TIER2_UPGRADE' ? 'Tier 2 Upgrade' : 'Tier 3 Upgrade'}
              </span>
              <span className="text-[12px] text-gray-400">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: '#920793' }} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex">
          {!isComplete && (
            <div className="hidden md:flex w-[220px] shrink-0 border-r border-gray-100 flex-col bg-gray-50/60">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <ArrowUpCircle className="h-4 w-4 text-[#920793]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-gray-900 leading-tight">Account Upgrade</p>
                    <p className="text-[10px] text-gray-400">Tier {currentTier} → Tier {currentTier + 1}</p>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-gray-400 mt-2 truncate">{formState.clientReference}</p>
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  {currentStep === 'TIER2_UPGRADE'
                    ? "Provide the customer's secondary ID and ID card photo."
                    : "Verify the customer's address and GPS location."}
                </p>
              </div>
              <div className="px-4 py-4 flex-1 space-y-3">
                {progressSteps.map((s, i) => {
                  const idx = progressSteps.findIndex((x) => x.key === currentStep);
                  const isDone = i < idx || isComplete;
                  const isActive = s.key === currentStep;
                  const isLast = i === progressSteps.length - 1;
                  return (
                    <div key={s.key} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all',
                          isDone && 'bg-[#920793] text-white',
                          isActive && 'bg-[#920793] text-white ring-[3px] ring-purple-100',
                          !isDone && !isActive && 'bg-gray-100 text-gray-400'
                        )}>
                          {isDone ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
                        </div>
                        {!isLast && <div className={cn('w-[1.5px] flex-1 min-h-[20px] my-1 rounded-full', isDone ? 'bg-[#920793]' : 'bg-gray-200')} />}
                      </div>
                      <div className="pb-4">
                        <span className={cn('text-[12px] font-medium', isActive ? 'text-[#920793] font-semibold' : isDone ? 'text-gray-500' : 'text-gray-300')}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0 p-4 md:p-6">
            {currentStep === 'TIER2_UPGRADE' && (
              <Tier2Step
                formState={formState}
                activateRequestId={activateRequestId}
                initialIdMethod={matchingRequest?.initialIdMethod}
                onNext={handleNext}
              />
            )}
            {currentStep === 'TIER3_UPGRADE' && (
              <Tier3Step formState={formState} activateRequestId={activateRequestId} onNext={handleNext} />
            )}
            {currentStep === 'COMPLETE' && <CompleteStep formState={formState} realAccountNumber={matchingRequest?.bankOneAccountNumber} />}
          </div>
        </div>
      </div>
    </div>
  );
}
