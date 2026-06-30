'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, RefreshCw, MapPin, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { tier3AddressSchema, Tier3AddressSchemaValues } from '../../schema/account-opening.schema';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { NativeSelect, NativeSelectOption } from '@src/components/ui/native-select';
import { NIGERIA_STATES } from '@src/constants/nigeria-states';
import { cn } from '@src/utils';
import { SearchableSelect } from '@src/components/ui/SearchableSelect';

type Props = { formState: IndividualSavingsFormState; onNext: (data: Partial<IndividualSavingsFormState>) => void; };

const input = `w-full h-11 px-3.5 rounded-xl text-[14px] font-medium text-gray-900 bg-white hover:bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#920793] focus:ring-4 focus:ring-[#920793]/10 outline-none transition-all placeholder:text-gray-400`;
const label = `block text-[13px] font-medium text-gray-700 mb-1.5`;
const btn = `w-full h-12 rounded-xl text-white text-[14px] font-bold bg-[#920793] hover:bg-[#7a067a] shadow-md shadow-[#920793]/20 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 mt-4`;

function UploadZone({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#920793] hover:bg-purple-50/50 transition-all">
      {children}
    </div>
  );
}

export function Tier3UpgradeStep({ formState, onNext }: Props) {
  const [proximity, setProximity] = useState<boolean | null>(formState.isProximityConfirmed);
  const [proofUrl, setProofUrl] = useState<string | null>(formState.proofOfAddressUrl);
  const [locationPhotoUrl, setLocationPhotoUrl] = useState<string | null>(formState.locationPhotoUrl);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(formState.gpsCoords);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const proofRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<Tier3AddressSchemaValues>({
    resolver: zodResolver(tier3AddressSchema),
    defaultValues: { 
      streetNumber: formState.streetNumber || '',
      streetName: formState.streetName || '',
      lga: formState.lga || '',
      city: formState.city || '',
      state: formState.state || '',
      landmark: formState.landmark || '',
      description: formState.description || '',
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

  function onSubmit(data: Tier3AddressSchemaValues) {
    if (!proofUrl || !locationPhotoUrl) return;
    onNext({ 
      isProximityConfirmed: proximity, 
      ...data,
      address: {
        houseNumber: data.streetNumber,
        street: data.streetName,
        landmark: data.landmark,
        city: data.city,
        lga: data.lga,
        state: data.state,
        country: 'NG',
      }, 
      proofOfAddressUrl: proofUrl, 
      locationPhotoUrl, 
      gpsCoords 
    });
  }

  if (proximity === null) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[14px] font-bold text-gray-900">Address Verification</p>
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
          <p className="text-[14px] font-bold text-gray-900">Address Verification — Remote</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Upload proof of address. Operations will review and approve within 1–2 business days.</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[12px] text-amber-700"><Clock className="inline-block h-3 w-3 mr-1 mb-0.5" />Address verification may take up to <strong>2 business days</strong>. Head of Operations / Internal Control will review and approve.</p>
        </div>
        <div>
          <label className={label}>Proof of Address</label>
          {proofUrl ? (
            <div className="relative">
              <img src={proofUrl} alt="Proof" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => setProofUrl(null)} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center"><RefreshCw className="h-3 w-3 text-gray-500" /></button>
            </div>
          ) : (
            <UploadZone onClick={() => proofRef.current?.click()}>
              <Camera className="h-6 w-6 text-gray-300" /><p className="text-[12px] text-gray-400">Upload proof of address</p>
            </UploadZone>
          )}
          <input ref={proofRef} type="file" accept="image/*"  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setProofUrl(URL.createObjectURL(f)); }} />
        </div>
        <button type="button" disabled={!proofUrl} onClick={() => onNext({ isProximityConfirmed: false, proofOfAddressUrl: proofUrl })} className={btn}>Submit for Review</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Address Verification</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Complete the customer's residential address details below.</p>
      </div>

      <div className="rounded-lg bg-purple-50 border border-[#920793]/20 px-3 py-2 flex items-start gap-2">
        <Clock className="h-4 w-4 text-[#920793] shrink-0 mt-0.5" />
        <p className="text-[12px] text-[#920793] leading-tight">
          <strong>Please note:</strong> Address verification may take up to <strong>2 business days</strong> to complete. The customer will be notified once approved by Operations.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label}>Street Number</label>
          <input className={cn(input, errors.streetNumber ? 'border-red-400' : 'border-gray-200')} placeholder="e.g. 14" {...register('streetNumber')} />
          {errors.streetNumber && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.streetNumber.message}</p>}
        </div>
        <div>
          <label className={label}>Street Name</label>
          <input className={cn(input, errors.streetName ? 'border-red-400' : 'border-gray-200')} placeholder="e.g. Awolowo Way" {...register('streetName')} />
          {errors.streetName && <p className="text-[12px] font-medium text-red-500 mt-1">{errors.streetName.message}</p>}
        </div>
      </div>

      <div>
        <label className={label}>State</label>
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
          <label className={label}>City</label>
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
          <label className={label}>LGA</label>
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
        <label className={label}>Landmark</label>
        <input className={`${input} ${errors.landmark ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`} placeholder="e.g. Near the big oak tree" {...register('landmark')} />
      </div>
      
      <div>
        <label className={label}>Description</label>
        <input className={`${input} ${errors.description ? 'border-red-400' : 'border-gray-200 focus:border-[#920793]'}`} placeholder="Additional details..." {...register('description')} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Proof of Address</label>
          {proofUrl ? (
            <div className="relative"><img src={proofUrl} alt="Proof" className="w-full h-24 object-cover rounded-lg border border-gray-200" /><button type="button" onClick={() => setProofUrl(null)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center"><RefreshCw className="h-2.5 w-2.5 text-gray-500" /></button></div>
          ) : (
            <UploadZone onClick={() => proofRef.current?.click()}><Camera className="h-5 w-5 text-gray-300" /><p className="text-[11px] text-gray-400">Utility bill</p></UploadZone>
          )}
          <input ref={proofRef} type="file" accept="image/*"  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setProofUrl(URL.createObjectURL(f)); }} />
        </div>
        <div>
          <label className={label}>Location Photo</label>
          {locationPhotoUrl ? (
            <div className="relative"><img src={locationPhotoUrl} alt="Location" className="w-full h-24 object-cover rounded-lg border border-gray-200" /><button type="button" onClick={() => setLocationPhotoUrl(null)} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center"><RefreshCw className="h-2.5 w-2.5 text-gray-500" /></button></div>
          ) : (
            <UploadZone onClick={() => locationRef.current?.click()}><Camera className="h-5 w-5 text-gray-300" /><p className="text-[11px] text-gray-400">Location photo</p></UploadZone>
          )}
          <input ref={locationRef} type="file" accept="image/*"  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) setLocationPhotoUrl(URL.createObjectURL(f)); }} />
        </div>
      </div>

      {/* <div>
        <label className={label}>GPS Location</label>
        {gpsCoords ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-green-700">Location captured</p>
              <p className="text-[11px] text-green-600 truncate">{gpsCoords.lat.toFixed(5)}, {gpsCoords.lng.toFixed(5)}</p>
            </div>
            <button type="button" onClick={() => setGpsCoords(null)}><RefreshCw className="h-3.5 w-3.5 text-gray-400" /></button>
          </div>
        ) : (
          <button type="button" onClick={captureGPS} disabled={gpsLoading}
            className="w-full h-9 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-[13px] font-medium text-gray-500 hover:border-[#920793] hover:text-[#920793] hover:bg-purple-50 transition-all disabled:opacity-50">
            <MapPin className="h-4 w-4" />{gpsLoading ? 'Getting location...' : 'Capture GPS Location'}
          </button>
        )}
        {gpsError && <p className="text-[12px] text-red-500 mt-1">{gpsError}</p>}
      </div> */}

      <button type="submit" disabled={!proofUrl || !locationPhotoUrl} className={btn}>Save and Continue</button>
    </form>
  );
}
