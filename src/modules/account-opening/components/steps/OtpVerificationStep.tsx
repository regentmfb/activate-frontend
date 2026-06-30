'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, ScanFace } from 'lucide-react';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useSwitchToManual, useVerificationSession, usePictureVerification } from '@src/modules/identity/hooks/useIdentityVerification';
import { appToast } from '@src/lib/toast';
import { useIdentro } from '@src/providers/IdentroProvider';
// import { FaceCaptureModal } from '../FaceCaptureModal';

type Props = {
  formState: IndividualSavingsFormState;
  onNext: (data: Partial<IndividualSavingsFormState>) => void;
  onManual: () => void;
  onLiveness: () => void;
  setStepMessage?: (msg: { type: 'success' | 'error' | 'info'; title: string; description: string | React.ReactNode }) => void;
};

const btn = `w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40`;

export function OtpVerificationStep({ formState, onNext, onManual, onLiveness, setStepMessage }: Props) {
  const { mutate: switchToManual, isPending: isSwitching } = useSwitchToManual();
  const { mutate: pictureVerification } = usePictureVerification();
  
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'scanning' | 'verifying' | 'failed' | 'passed'>('idle');
  const [showFaceModal, setShowFaceModal] = useState(false);

  const { data: session } = useVerificationSession(formState.verificationId ?? '', {
    enabled: !!formState.verificationId,
  });

  const isFailed = session?.status === 'FAILED';

  function handleManual() {
    if (!formState.verificationId) { 
      onManual(); 
      return; 
    }
    switchToManual(
      { verificationId: formState.verificationId, reason: 'Customer unable to complete face verification' },
      { onSuccess: () => onManual(), onError: () => onManual() }
    );
  }

  const { startLiveness } = useIdentro();

  async function handleLiveness() {
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
    setLivenessStatus('scanning');
    
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
        setLivenessStatus('failed');
        
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
      
      setLivenessStatus('passed');
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
        onLiveness();
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
      setLivenessStatus('failed');
    }
  }
  useEffect(() => {
    if (isFailed && setStepMessage) {
      setStepMessage({
        type: 'error',
        title: 'Verification Failed',
        description: session?.manualModeReason ?? 'The BVN details could not be verified. Please check the details and try again.',
      });
    }
  }, [isFailed, setStepMessage, session?.manualModeReason]);

  if (isFailed) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-[14px] font-bold text-gray-900">Choose a Fallback Option</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Your automated verification failed. How would you like to proceed?</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleManual}
            disabled={isSwitching}
            className="flex-1 h-9 rounded-lg text-[13px] font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSwitching ? 'Switching…' : 'Manual Mode'}
          </button>
          <button
            type="button"
            onClick={handleLiveness}
            className="flex-1 h-9 rounded-lg text-[13px] font-semibold border border-[#920793] text-[#920793] hover:bg-purple-50 transition-colors disabled:opacity-50"
          >
            Retry Face Verification
          </button>
        </div>
        {/* 
        {showFaceModal && (
          <FaceCaptureModal
            onCapture={handleCapture}
            onClose={() => {
              setShowFaceModal(false);
              setLivenessStatus('idle');
            }}
          />
        )}
        */}
      </div>
    );
  }

  if (livenessStatus === 'scanning') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <svg className="animate-spin h-6 w-6 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-gray-700">Opening camera…</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Please align the customer's face in the camera frame once the scanner loads.</p>
        </div>
        {/* 
        {showFaceModal && (
          <FaceCaptureModal
            onCapture={handleCapture}
            onClose={() => {
              setShowFaceModal(false);
              setLivenessStatus('idle');
            }}
          />
        )}
        */}
      </div>
    );
  }

  if (livenessStatus === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <svg className="animate-spin h-6 w-6 text-[#920793]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-gray-700">Verifying face check…</p>
          <p className="text-[12px] text-gray-400 mt-0.5">Checking captured image against national database.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">
          {isSwitching ? 'Manual Verification' : 'Face Verification'}
        </p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {isSwitching 
            ? 'Switching to manual verification mode...'
            : `Verify the customer's identity with a live facial scan. This automatically validates their ${formState.verificationMethod} against national records.`}
        </p>
      </div>

      <button
        type="button"
        onClick={handleLiveness}
        className="max-w-sm w-full mx-auto h-[120px] rounded-xl border-2 border-dashed border-[#920793] flex flex-col items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 transition-all"
      >
        <ScanFace className="h-10 w-10 text-[#920793]" />
        <p className="text-[13px] font-semibold text-[#920793]">
          Start Face Verification
        </p>
      </button>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2 mt-4">
        <p className="text-[12px] font-semibold text-amber-800">Cannot use camera or verification failed?</p>
        <p className="text-[12px] text-amber-700">
          You can bypass this step using manual verification. The account will require review by Operations before activation.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={handleManual}
            disabled={isSwitching}
            className="w-full h-9 rounded-lg text-[13px] font-bold border border-amber-300 text-amber-800 hover:bg-amber-100/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwitching ? 'Switching to Manual Mode…' : 'Proceed with Manual Mode'}
          </button>
        </div>
      </div>
      
      {/* 
      {showFaceModal && (
        <FaceCaptureModal
          onCapture={handleCapture}
          onClose={() => {
            setShowFaceModal(false);
            setLivenessStatus('idle');
          }}
        />
      )}
      */}
    </div>
  );
}
