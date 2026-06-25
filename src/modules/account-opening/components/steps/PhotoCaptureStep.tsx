'use client';

import { useRef, useState } from 'react';
import { Camera, RefreshCw, CheckCircle2, ScanFace, Upload } from 'lucide-react';
import { DocumentUploadModal } from '@/src/modules/documents/components/DocumentUploadModal';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { FaceCaptureModal } from '../FaceCaptureModal';

type Props = {
  formState: any;
  onNext: (data: { customerPhotoUrl: string | null; customerPhotoFile?: File | null }) => void;
  isSubmitting?: boolean;
};

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function PhotoCaptureStep({ formState, onNext, isSubmitting }: Props) {
  // Check if liveness photo exists — if so, pre-fill
  const hasLivenessPhoto = !!formState.livenessPhotoUrl;
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    formState.customerPhotoUrl ?? formState.livenessPhotoUrl ?? null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(formState.customerPhotoFile ?? null);
  const [showFaceModal, setShowFaceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const usedFace = formState.verificationMethod === 'FACE';

  function handleFileCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoUrl(URL.createObjectURL(file));
      setPhotoFile(file);
    }
  }

  function openCapture() {
    if (usedFace) {
      setShowFaceModal(true);
    } else {
      inputRef.current?.click();
    }
  }

  function handleDocumentUpload(result: any) {
    setPhotoUrl(result.url);
    setPhotoFile(null); // Already uploaded to the backend via the modal
    setShowUploadModal(false);
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <p className="text-[14px] font-bold text-gray-900">Customer Photo</p>
          <p className="text-[12px] text-gray-500 mt-0.5">
            {hasLivenessPhoto
              ? 'The liveness check photo has been carried over. You can retake if needed.'
              : 'Take a clear photo of the customer&apos;s face for identity verification.'}
          </p>
        </div>

        {hasLivenessPhoto && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-[12px] text-green-700 font-medium">
              Liveness photo carried over from verification. You can retake if needed.
            </p>
          </div>
        )}

        <div className="flex items-center gap-4">
          {photoUrl ? (
            <div className="relative shrink-0">
              <img
                src={photoUrl}
                alt="Customer"
                className="w-24 h-24 rounded-full object-cover border-[3px] border-[#920793]"
              />
              <button
                onClick={() => { setPhotoUrl(null); if (inputRef.current) inputRef.current.value = ''; }}
                className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-500 hover:text-[#920793]"
              >
                <RefreshCw className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={openCapture}
              className="w-24 h-24 rounded-full border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#920793] hover:bg-purple-50 transition-all shrink-0"
            >
              {usedFace
                ? <ScanFace className="h-6 w-6 text-gray-300" />
                : <Camera className="h-6 w-6 text-gray-300" />
              }
              <p className="text-[10px] text-gray-400">Tap</p>
            </div>
          )}

          <div className="flex-1 space-y-2">
            <p className="text-[12px] text-gray-500">
              {usedFace
                ? 'Use the live face scanner for a clear photo.'
                : 'Use the front-facing camera for a clear face photo.'
              }
            </p>
            {!photoUrl && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={openCapture}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#920793] text-[#920793] font-semibold text-[12px] hover:bg-purple-50 transition-colors"
                >
                  {usedFace
                    ? <><ScanFace className="h-3.5 w-3.5" /> Face Scanner</>
                    : <><Camera className="h-3.5 w-3.5" /> Camera</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 font-semibold text-[12px] hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload
                </button>
              </div>
            )}
          </div>
        </div>

        <input ref={inputRef} type="file" accept="image/*"  className="sr-only" onChange={handleFileCapture} />

        <button
          type="button"
          disabled={!photoUrl || isSubmitting}
          onClick={() => onNext({ customerPhotoUrl: photoUrl, customerPhotoFile: photoFile })}
          className={btn}
        >
          {isSubmitting ? 'Submitting…' : 'Continue'}
        </button>
      </div>

      {showFaceModal && (
        <FaceCaptureModal
          onCapture={(url) => {
            setPhotoUrl(url);
            try {
              const file = dataURLtoFile(url, 'customer_photo.jpg');
              setPhotoFile(file);
            } catch (e) {
              console.error('Failed to convert base64 photo capture to file:', e);
            }
            setShowFaceModal(false);
          }}
          onClose={() => setShowFaceModal(false)}
        />
      )}

      {showUploadModal && (
        <DocumentUploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          activateRequestId={formState.accountRequestId || 'temp-id'}
          customerId={formState.accountRequestId || 'temp-customer'}
          documentType="CUSTOMER_PHOTO"
          source="GALLERY"
          title="Upload Customer Photo"
          description="Select a clear photo of the customer's face"
          validationOptions={{
            maxSize: 5 * 1024 * 1024, // 5MB
            acceptedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          }}
          onSuccess={handleDocumentUpload}
        />
      )}
    </>
  );
}
