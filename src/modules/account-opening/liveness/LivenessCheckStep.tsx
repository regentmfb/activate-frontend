'use client';

import { useState } from 'react';
import { ScanFace, CheckCircle2, AlertCircle } from 'lucide-react';
import { IndividualSavingsFormState } from '../types/wizard.types';
// import { FaceCaptureModal } from '../components/FaceCaptureModal';
import { usePictureVerification } from '../../identity/hooks/useIdentityVerification';
import { useIdentro } from '@src/providers/IdentroProvider';
import { appToast } from '@/src/lib/toast';

type Props = {
  formState: IndividualSavingsFormState;
  onNext: (data: Partial<IndividualSavingsFormState>) => void;
  setStepMessage?: (msg: { type: 'success' | 'error' | 'info'; title: string; description: string | React.ReactNode }) => void;
};

type LivenessStatus = 'idle' | 'scanning' | 'verifying' | 'failed' | 'passed';

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function LivenessCheckStep({ formState, onNext, setStepMessage }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(formState.livenessPhotoUrl ?? null);
  const [status, setStatus] = useState<LivenessStatus>(formState.livenessPhotoUrl ? 'passed' : 'idle');
  // const [showFaceModal, setShowFaceModal] = useState(false);

  const { startLiveness } = useIdentro();

  async function triggerLiveness() {
    if (!formState.verificationId) {
      if (setStepMessage) {
        setStepMessage({
          type: 'error',
          title: 'Session Missing',
          description: 'No active verification session was found. Please return to the first step and try again.',
        });
      } else {
        appToast.error('No verification session active.');
      }
      return;
    }
    
    setStatus('scanning');
    
    try {
      const isBVN = formState.verificationMethod === 'BVN';
      const result = await startLiveness({
        serviceType: isBVN ? 'FACE_LIVENESS_BVN' : 'FACE_LIVENESS_NIN',
        sourceType: isBVN ? 'BVN' : 'NIN',
        bvn: isBVN ? formState.identityValue : undefined,
        nin: !isBVN ? formState.identityValue : undefined,
        consentCaptured: true,
        consentReference: `CONSENT-${formState.verificationId}`,
        idempotencyKey: `LIVE-${formState.verificationId}-${Date.now()}`
      });

      console.log('Identro Liveness Success:', result);
      let capturedImage = result?.data?.selfieUrl || result?.selfieBase64 || result?.source?.base64Image || result?.source?.photo || result?.identity?.photo || ''; 
    if (capturedImage && !capturedImage.startsWith('http') && !capturedImage.startsWith('data:')) {
      capturedImage = `data:image/jpeg;base64,${capturedImage}`;
    }

      const livenessScore = Math.round(Number(result.liveness?.score) || 0);
      const matchScore = Math.round(Number(result.match?.score) || 0);
      
      // Override Identro's strict threshold (defaults to 80)
      const isLivenessOk = result.liveness?.passed !== false || livenessScore >= 70;
      const isMatchOk = result.match?.matched !== false || matchScore >= 70;

      if (result.status === 'FAILED' || !isLivenessOk || !isMatchOk) {
        setStatus('failed');
        
        let baseMessage = 'Face verification failed.';
        
        if (!isLivenessOk && result.liveness?.message) {
          baseMessage = result.liveness.message;
        } else if (!isMatchOk && result.match?.message) {
          baseMessage = result.match.message;
        } else if (result.message) {
          baseMessage = result.message;
        }

        const verificationScore = Math.min(livenessScore, matchScore);
        const errorMessage = (
          <div className="space-y-3 mt-1">
            <p>{baseMessage}</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                <span><strong className="font-semibold text-red-900">Required Score:</strong> 70%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                <span><strong className="font-semibold text-red-900">Actual Score:</strong> {verificationScore}%</span>
              </li>
            </ul>
          </div>
        );

        if (setStepMessage) {
          setStepMessage({
            type: 'error',
            title: 'Face Verification Failed',
            description: errorMessage,
          });
        } else {
          appToast.error(`${baseMessage} - Score: ${verificationScore}%`);
        }
        return;
      }
      
      setPhotoUrl(capturedImage);
      setStatus('passed');
      if (setStepMessage) {
        const verificationScore = Math.min(livenessScore, matchScore);
        const successMessage = (
          <div className="space-y-3 mt-1">
            <p>Face verification passed successfully.</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                <span><strong className="font-semibold text-green-900">Required Score:</strong> 70%</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 shrink-0" />
                <span><strong className="font-semibold text-green-900">Actual Score:</strong> {verificationScore}%</span>
              </li>
            </ul>
          </div>
        );
        
        setStepMessage({
          type: 'success',
          title: 'Verification Successful',
          description: successMessage,
        });
      } else {
        appToast.success('Face verification successful!');
      }
      
      setTimeout(() => {
        onNext({
          livenessPhotoUrl: capturedImage,
          customerPhotoUrl: capturedImage,
        });
      }, 2500);

    } catch (error: any) {
      console.error('Identro Liveness Failed:', error);
      if (setStepMessage) {
        setStepMessage({
          type: 'error',
          title: 'System Error',
          description: error.message || 'Face verification failed or was cancelled.',
        });
      } else {
        appToast.error(error.message || 'Face verification failed or was cancelled.');
      }
      setStatus('failed');
    }
  }

  function handleContinue() {
    onNext({
      livenessPhotoUrl: photoUrl!,
      customerPhotoUrl: photoUrl!,
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Face Verification</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Capture the customer&apos;s face live. This photo will also be used as their account photo.
        </p>
      </div>

      {/* Photo capture area */}
      {status === 'passed' ? (
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={photoUrl || undefined}
              alt="Liveness capture"
              className="w-24 h-24 rounded-full object-cover border-[3px] border-[#920793]"
            />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[13px] font-semibold text-gray-800">
              Face verification passed ✓
            </p>
            <button
              type="button"
              onClick={triggerLiveness}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#920793] hover:underline disabled:opacity-50"
            >
              <ScanFace className="h-3 w-3" /> Retake Photo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerLiveness}
          disabled={status === 'scanning' || status === 'verifying'}
          className="mx-auto w-full max-w-[280px] h-[100px] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-[#920793] hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ScanFace className="h-9 w-9 text-gray-300" />
          <p className="text-[13px] font-semibold text-gray-400">
            {status === 'scanning' || status === 'verifying' ? 'Starting camera…' : 'Tap to open face scanner'}
          </p>
          <p className="text-[11px] text-gray-400 max-w-[220px] text-center">
            Position the face within the oval in good lighting
          </p>
        </button>
      )}

      {/* Continue — only after passed */}
      {status === 'passed' && (
        <button type="button" onClick={handleContinue} className={btn}>
          Continue
        </button>
      )}

      {status !== 'passed' && (
        <button type="button" disabled className={btn}>
          Capture and verify face photo to continue
        </button>
      )}

      {/* 
      {showFaceModal && (
        <FaceCaptureModal
          onCapture={handleCapture}
          onClose={() => {
            setShowFaceModal(false);
            setStatus(photoUrl ? (status === 'verifying' ? 'failed' : status) : 'idle');
          }}
        />
      )}
      */}
    </div>
  );
}
