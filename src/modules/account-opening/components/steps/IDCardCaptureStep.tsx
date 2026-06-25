'use client';

import { useRef, useState } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { IndividualCurrentFormState } from '../../types/wizard.types';

type Props = {
  formState: any;
  onNext: (data: { idCardPhotoUrl: string | null; idCardPhotoFile?: File | null }) => void;
};

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function IDCardCaptureStep({ formState, onNext }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(formState.idCardPhotoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(formState.idCardPhotoFile ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">ID Card Photo</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Take a clear photo of the customer&apos;s official government-issued ID card.</p>
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
        <p className="text-[12px] text-amber-700">Accepted IDs: National ID, Driver&apos;s License, International Passport, Voter&apos;s Card.</p>
      </div>

      {photoUrl ? (
        <div className="relative">
          <img src={photoUrl} alt="ID Card" className="w-full h-40 object-cover rounded-xl border border-gray-200" />
          <button
            onClick={() => { setPhotoUrl(null); if (inputRef.current) inputRef.current.value = ''; }}
            className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-500 hover:text-[#920793]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-36 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#920793] hover:bg-purple-50 transition-all"
        >
          <Camera className="h-7 w-7 text-gray-300" />
          <p className="text-[12px] text-gray-400 font-medium">Tap to capture ID card</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*"  className="sr-only" onChange={handleCapture} />

      <button
        type="button"
        disabled={!photoUrl}
        onClick={() => onNext({ idCardPhotoUrl: photoUrl, idCardPhotoFile: photoFile })}
        className={btn}
      >
        Continue
      </button>
    </div>
  );
}
