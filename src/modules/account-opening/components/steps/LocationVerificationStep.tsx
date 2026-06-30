'use client';

import { useRef, useState } from 'react';
import { Camera, RefreshCw, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { IndividualCurrentFormState } from '../../types/wizard.types';

type Props = {
  formState: IndividualCurrentFormState;
  onNext: (data: Partial<IndividualCurrentFormState>) => void;
  isSubmitting?: boolean;
};

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;
const label = `block text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1`;

function UploadZone({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <div onClick={onClick} className="w-full h-24 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#920793] hover:bg-purple-50 transition-all">
      {children}
    </div>
  );
}

export function LocationVerificationStep({ formState, onNext, isSubmitting }: Props) {
  const [proximity, setProximity] = useState<boolean | null>(formState.isProximityConfirmed);
  const [proofUrl, setProofUrl] = useState<string | null>(formState.proofOfAddressUrl);
  const [proofFile, setProofFile] = useState<File | null>(formState.proofOfAddressFile ?? null);
  const [locationPhotoUrl, setLocationPhotoUrl] = useState<string | null>(formState.locationPhotoUrl);
  const [locationPhotoFile, setLocationPhotoFile] = useState<File | null>(formState.locationPhotoFile ?? null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(formState.gpsCoords);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const proofRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef<HTMLInputElement>(null);

  function captureGPS() {
    setGpsLoading(true); setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => { setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsLoading(false); },
      () => { setGpsError('Could not get location. Enable GPS and try again.'); setGpsLoading(false); },
      { timeout: 10000 }
    );
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
          <p className="text-[14px] font-bold text-gray-900">Remote Address Verification</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Upload the customer&apos;s proof of address. Operations will verify remotely.</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[12px] text-amber-700">You are not permitted to auto-verify. Head of Operations will review.</p>
        </div>
        <div>
          <label className={label}>Proof of Address</label>
          {proofUrl ? (
            <div className="relative">
              <img src={proofUrl} alt="Proof" className="w-full h-32 object-cover rounded-lg border border-gray-200" />
              <button type="button" onClick={() => { setProofUrl(null); setProofFile(null); }} className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-white border shadow flex items-center justify-center"><RefreshCw className="h-3 w-3 text-gray-500" /></button>
            </div>
          ) : (
            <UploadZone onClick={() => proofRef.current?.click()}>
              <Camera className="h-6 w-6 text-gray-300" /><p className="text-[12px] text-gray-400">Upload proof of address</p>
            </UploadZone>
          )}
          <input ref={proofRef} type="file" accept="image/*"  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProofUrl(URL.createObjectURL(f)); setProofFile(f); } }} />
        </div>
        <button type="button" disabled={!proofUrl || isSubmitting} onClick={() => onNext({ isProximityConfirmed: false, proofOfAddressUrl: proofUrl, proofOfAddressFile: proofFile })} className={btn}>{isSubmitting ? 'Submitting...' : 'Continue'}</button>
      </div>
    );
  }

  const canSubmit = proofUrl && locationPhotoUrl && gpsCoords;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Address Verification</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Complete address verification.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Proof of Address</label>
          {proofUrl ? (
            <div className="relative"><img src={proofUrl} alt="Proof" className="w-full h-24 object-cover rounded-lg border border-gray-200" /><button type="button" onClick={() => { setProofUrl(null); setProofFile(null); }} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center"><RefreshCw className="h-2.5 w-2.5 text-gray-500" /></button></div>
          ) : (
            <UploadZone onClick={() => proofRef.current?.click()}><Camera className="h-5 w-5 text-gray-300" /><p className="text-[11px] text-gray-400">Utility bill</p></UploadZone>
          )}
          <input ref={proofRef} type="file" accept="image/*"  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setProofUrl(URL.createObjectURL(f)); setProofFile(f); } }} />
        </div>
        <div>
          <label className={label}>Location Photo</label>
          {locationPhotoUrl ? (
            <div className="relative"><img src={locationPhotoUrl} alt="Location" className="w-full h-24 object-cover rounded-lg border border-gray-200" /><button type="button" onClick={() => { setLocationPhotoUrl(null); setLocationPhotoFile(null); }} className="absolute top-1 right-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center"><RefreshCw className="h-2.5 w-2.5 text-gray-500" /></button></div>
          ) : (
            <UploadZone onClick={() => locationRef.current?.click()}><Camera className="h-5 w-5 text-gray-300" /><p className="text-[11px] text-gray-400">Location photo</p></UploadZone>
          )}
          <input ref={locationRef} type="file" accept="image/*"  className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLocationPhotoUrl(URL.createObjectURL(f)); setLocationPhotoFile(f); } }} />
        </div>
      </div>

      <div>
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
      </div>

      <button type="button" disabled={!canSubmit || isSubmitting}
        onClick={() => onNext({
          isProximityConfirmed: true,
          proofOfAddressUrl: proofUrl,
          locationPhotoUrl,
          proofOfAddressFile: proofFile,
          locationPhotoFile,
          gpsCoords,
        })}
        className={btn}>
        {isSubmitting ? 'Submitting...' : 'Continue'}
      </button>
    </div>
  );
}
