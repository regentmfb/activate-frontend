import { Check } from 'lucide-react';
import { cn } from '@src/utils';
import { WizardStep } from '@src/modules/account-opening/types/wizard.types';

type Props = {
  steps: WizardStep[];
  currentStep: WizardStep;
};

const LABELS: Record<WizardStep, string> = {
  IDENTITY_INPUT: 'Identity',
  OTP_VERIFICATION: 'Verify OTP',
  FACE_PROCESSING: 'Face Match',
  LIVENESS_CHECK: 'Liveness Check',
  BIODATA_CONFIRMATION: 'Biodata',
  PHOTO_CAPTURE: 'Photo',
  TIER1_SUCCESS: 'Tier 1',
  TIER1_FAILED: 'Tier 1',
  TIER2_UPGRADE: 'Tier 2',
  TIER2_SUCCESS: 'Tier 2',
  TIER2_FAILED: 'Tier 2',
  TIER3_UPGRADE: 'Tier 3',
  TIER3_SUCCESS: 'Tier 3',
  TIER3_FAILED: 'Tier 3',
  COMPLETE: 'Done',
};

export function SavingsStepper({ steps, currentStep }: Props) {
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
