import { Check } from 'lucide-react';
import { cn } from '@src/utils';
import { CurrentWizardStep } from '../types/wizard.types';

type Props = {
  steps: CurrentWizardStep[];
  currentStep: CurrentWizardStep;
};

const LABELS: Record<string, string> = {
  IDENTITY_INPUT: 'Identity',
  OTP_VERIFICATION: 'Verify OTP',
  FACE_PROCESSING: 'Face Match',
  LIVENESS_CHECK: 'Liveness Check',
  BIODATA_CONFIRMATION: 'Biodata',
  // ADDITIONAL_INFO: 'More Info',
  PHOTO_CAPTURE: 'Photo',
  ID_CARD_CAPTURE: 'ID Card',
  LOCATION_VERIFICATION: 'Location',
  REFERENCE_UPLOAD: 'Reference',
  SUBMIT_SUCCESS: 'Done',
  SUBMIT_FAILED: 'Done',
  COMPLETE: 'Done',
};

export function CurrentStepper({ steps, currentStep }: Props) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isLast = i === steps.length - 1;

        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all',
                isDone && 'bg-[#920793] text-white',
                isActive && 'bg-[#920793] text-white ring-[3px] ring-purple-100',
                !isDone && !isActive && 'bg-gray-100 text-gray-400'
              )}>
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {!isLast && (
                <div className={cn(
                  'w-[1.5px] flex-1 min-h-[20px] my-1 rounded-full transition-all',
                  isDone ? 'bg-[#920793]' : 'bg-gray-200'
                )} />
              )}
            </div>
            <div className="pb-4">
              <span className={cn(
                'text-[12px] font-medium leading-none',
                isActive ? 'text-[#920793] font-semibold' : isDone ? 'text-gray-500' : 'text-gray-300'
              )}>
                {LABELS[step]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
