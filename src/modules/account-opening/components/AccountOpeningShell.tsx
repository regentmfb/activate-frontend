'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Save, FileText, Plus } from 'lucide-react';
import { cn } from '@src/utils';

type Props = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  clientReference: string;
  steps: string[];
  currentStep: string;
  stepLabels: Record<string, string>;
  stepDescription: string;
  isComplete: boolean;
  onSaveDraft?: () => void;
  // Draft resume prompt
  showDraftPrompt?: boolean;
  onResumeDraft?: () => void;
  onDiscardDraft?: () => void;
  children: React.ReactNode;
};

function MobileProgressBar({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: string;
}) {
  const currentIndex = steps.indexOf(currentStep);
  const progress = ((currentIndex) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-[#920793]">
          Step {currentIndex + 1} of {steps.length}
        </span>
        <span className="text-[12px] text-gray-400">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: '#920793' }}
        />
      </div>
    </div>
  );
}

function DesktopStepper({
  steps,
  currentStep,
  stepLabels,
}: {
  steps: string[];
  currentStep: string;
  stepLabels: Record<string, string>;
}) {
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
                {stepLabels[step]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function AccountOpeningShell({
  title,
  subtitle,
  icon,
  clientReference,
  steps,
  currentStep,
  stepLabels,
  stepDescription,
  isComplete,
  onSaveDraft,
  showDraftPrompt,
  onResumeDraft,
  onDiscardDraft,
  children,
}: Props) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSaveDraft?.();
    setSaved(true);
    setTimeout(() => {
      router.push('/tasks');
    }, 800);
  }

  // Show draft resume/discard prompt before rendering the wizard
  if (showDraftPrompt && onResumeDraft && onDiscardDraft) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-[#920793]" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-gray-900">You have a saved draft</p>
            <p className="text-[13px] text-gray-500 mt-1">
              Would you like to continue where you left off, or start a fresh account opening?
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={onResumeDraft}
              className="flex-1 h-11 rounded-xl text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#920793' }}
            >
              <FileText className="h-4 w-4" /> Resume Draft
            </button>
            <button
              onClick={onDiscardDraft}
              className="flex-1 h-11 rounded-xl text-[13px] font-semibold border border-gray-200 text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" /> Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Back button + Save draft */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        {!isComplete && onSaveDraft && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#920793] hover:opacity-75 transition-opacity"
          >
            {saved ? (
              <><Check className="h-3.5 w-3.5" /> Saved!</>
            ) : (
              <><Save className="h-3.5 w-3.5" /> Save & Continue Later</>
            )}
          </button>
        )}
      </div>

      {/* Mobile: progress bar header */}
      {!isComplete && (
        <div className="md:hidden bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-900 leading-tight">{title}</p>
              <p className="text-[10px] text-gray-400">{subtitle}</p>
            </div>
          </div>
          <MobileProgressBar steps={steps} currentStep={currentStep} />
          <p className="text-[12px] text-gray-500">{stepDescription}</p>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex">

          {/* Desktop left sidebar — hidden on mobile */}
          {!isComplete && (
            <div className="hidden md:flex w-[220px] shrink-0 border-r border-gray-100 flex-col bg-gray-50/60">
              <div className="px-4 pt-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-gray-900 leading-tight">{title}</p>
                    <p className="text-[10px] text-gray-400">{subtitle}</p>
                  </div>
                </div>
                <p className="text-[10px] font-mono text-gray-400 mt-2 truncate">{clientReference}</p>
              </div>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-[11px] text-gray-500 leading-relaxed">{stepDescription}</p>
              </div>
              <div className="px-4 py-4 flex-1">
                <DesktopStepper steps={steps} currentStep={currentStep} stepLabels={stepLabels} />
              </div>
            </div>
          )}

          {/* Form area */}
          <div className="flex-1 min-w-0 p-4 md:p-6">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
