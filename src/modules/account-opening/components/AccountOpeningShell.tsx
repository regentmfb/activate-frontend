'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Save, FileText, Plus } from 'lucide-react';
import { cn } from '@src/utils';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@src/components/ui/alert-dialog';

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
  stepMessage?: { type: 'success' | 'error' | 'info'; title: string; description: string | React.ReactNode } | null;
  onClearStepMessage?: () => void;
  onSaveDraft?: () => void;
  onBack?: () => void;
  onStepClick?: (step: string) => void;
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
  const progress = Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100));

  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${progress}%`, backgroundColor: '#920793' }}
      />
    </div>
  );
}

function DesktopStepper({
  steps,
  currentStep,
  stepLabels,
  onStepClick,
}: {
  steps: string[];
  currentStep: string;
  stepLabels: Record<string, string>;
  onStepClick?: (step: string) => void;
}) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="flex flex-col gap-0 relative">
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isLast = i === steps.length - 1;
        const isUnclickableTier = step.startsWith('TIER');

        return (
          <div key={step} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <button
                type="button"
                disabled={isUnclickableTier || (!isDone && !isActive)}
                onClick={() => !isUnclickableTier && onStepClick?.(step)}
                className={cn(
                  'h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all',
                  isDone && !isUnclickableTier ? 'bg-[#920793] text-white hover:opacity-80 cursor-pointer' : isDone ? 'bg-[#920793] text-white cursor-default' : '',
                  isActive && 'bg-[#920793] text-white ring-[3px] ring-purple-100 cursor-default',
                  !isDone && !isActive && 'bg-gray-100 text-gray-400 cursor-pointer hover:bg-gray-200',
                  isUnclickableTier && !isDone && !isActive && 'bg-gray-100 text-gray-400 cursor-default hover:bg-gray-100'
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </button>
              {!isLast && (
                <div className={cn(
                  'w-[1.5px] flex-1 min-h-[20px] my-1 rounded-full transition-all',
                  isDone ? 'bg-[#920793]' : 'bg-gray-100'
                )} />
              )}
            </div>
            <div className="pb-4">
              <button
                type="button"
                disabled={isUnclickableTier}
                onClick={() => !isUnclickableTier && onStepClick?.(step)}
                className={cn(
                  'text-[12px] font-medium leading-none text-left',
                  isActive ? 'text-[#920793] font-semibold' : isDone && !isUnclickableTier ? 'text-gray-500 hover:text-gray-900 cursor-pointer' : isDone ? 'text-gray-500 cursor-default' : 'text-gray-300'
                )}
              >
                {stepLabels[step]}
              </button>
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
  stepMessage,
  onClearStepMessage,
  onSaveDraft,
  onBack,
  onStepClick,
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
          onClick={() => onBack ? onBack() : router.back()}
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
          onClick={() => onBack ? onBack() : router.back()}
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
                <DesktopStepper steps={steps} currentStep={currentStep} stepLabels={stepLabels} onStepClick={onStepClick} />
              </div>
            </div>
          )}

          {/* Form area */}
          <div className="flex-1 min-w-0 p-4 md:p-6 flex flex-col gap-4">
            <AlertDialog open={!!stepMessage} onOpenChange={(open) => { if (!open) onClearStepMessage?.(); }}>
              <AlertDialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                <div className={cn(
                  "h-2 w-full",
                  stepMessage?.type === 'error' ? 'bg-red-500' : stepMessage?.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                )} />
                <div className="p-6 pt-8 text-center flex flex-col items-center">
                  <div className={cn(
                    "h-16 w-16 rounded-full flex items-center justify-center mb-5 ring-8",
                    stepMessage?.type === 'error' ? 'bg-red-100 text-red-500 ring-red-50' : 
                    stepMessage?.type === 'success' ? 'bg-green-100 text-green-500 ring-green-50' : 
                    'bg-blue-100 text-blue-500 ring-blue-50'
                  )}>
                    {stepMessage?.type === 'error' && (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    {stepMessage?.type === 'success' && (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {stepMessage?.type === 'info' && (
                      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <AlertDialogHeader className="w-full flex flex-col items-center justify-center text-center sm:text-center sm:place-items-center">
                    <AlertDialogTitle className="text-[20px] font-black text-gray-900 text-center w-full">
                      {stepMessage?.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-[14px] text-gray-500 mt-2 text-center leading-relaxed w-full">
                      {stepMessage?.description}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="w-full mt-8 sm:justify-center">
                    <AlertDialogAction 
                      onClick={onClearStepMessage}
                      className={cn(
                        "w-full h-12 rounded-xl text-[14px] font-bold shadow-sm transition-all hover:scale-[1.02]",
                        stepMessage?.type === 'error' ? 'bg-red-500 hover:bg-red-600' : 
                        stepMessage?.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 
                        'bg-blue-500 hover:bg-blue-600'
                      )}
                    >
                      Okay, got it
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </div>
              </AlertDialogContent>
            </AlertDialog>
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
