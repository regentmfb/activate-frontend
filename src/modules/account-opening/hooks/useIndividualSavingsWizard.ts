'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateClientReference } from '@src/utils';
import { WizardStep, IndividualSavingsFormState } from '../types/wizard.types';
import { SAVINGS_STEP_LABELS } from '@src/constants/labels';
import { useSaveDraft, useDeleteDraft, useGetDrafts } from '@src/modules/drafts/api/drafts.api';

const STEPS: WizardStep[] = [
  'IDENTITY_INPUT',
  'OTP_VERIFICATION',
  'BIODATA_CONFIRMATION',
  'PHOTO_CAPTURE',
  'TIER1_SUCCESS',
  'TIER1_FAILED',
  'TIER2_UPGRADE',
  'TIER2_SUCCESS',
  'TIER2_FAILED',
  'TIER3_UPGRADE',
  'TIER3_SUCCESS',
  'TIER3_FAILED',
  'COMPLETE',
];

const STEP_LABELS = SAVINGS_STEP_LABELS;

// Steps shown in the progress sidebar (no result steps)
const PROGRESS_STEPS: WizardStep[] = [
  'IDENTITY_INPUT',
  'OTP_VERIFICATION',
  'BIODATA_CONFIRMATION',
  'PHOTO_CAPTURE',
  'TIER1_SUCCESS',
  'TIER2_UPGRADE',
  'TIER3_UPGRADE',
];

const DRAFT_KEY = 'activate_savings_draft';

const initialState: IndividualSavingsFormState = {
  clientReference: generateClientReference(),
  verificationMethod: 'BVN',
  firstName: '',
  lastName: '',
  identityValue: '',
  otpValue: '',
  verificationId: null,
  biodata: null,
  customerPhotoUrl: null,
  livenessPhotoUrl: null,
  secondaryIdMethod: null,
  secondaryIdValue: '',
  idCardPhotoUrl: null,
  isProximityConfirmed: null,
  address: '',
  proofOfAddressUrl: null,
  locationPhotoUrl: null,
  gpsCoords: null,
  accountRequestId: null,
  accountNumber: null,
};

function loadDraft(): { step: WizardStep; state: IndividualSavingsFormState } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useIndividualSavingsWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftIdParam = searchParams.get('draftId');
  const { data: drafts } = useGetDrafts();
  
  const [activeDraftId, setActiveDraftId] = useState<string | undefined>(draftIdParam || undefined);
  const activeDraftIdRef = useRef<string | undefined>(draftIdParam || undefined);

  function updateActiveDraftId(id: string) {
    setActiveDraftId(id);
    activeDraftIdRef.current = id;
  }
  
  // Find if we have a draft passed in URL or currently active
  const serverDraft = drafts?.find((d) => d.id === (draftIdParam || activeDraftId));
  
  // Local fallback for unsynced changes
  const localDraft = typeof window !== 'undefined' ? loadDraft() : null;
  const draftState = serverDraft?.draftData?.state ?? localDraft?.state;
  const draftStep = serverDraft?.draftData?.step ?? localDraft?.step;

  const [currentStep, setCurrentStep] = useState<WizardStep>(draftStep ?? 'IDENTITY_INPUT');
  const [formState, setFormState] = useState<IndividualSavingsFormState>(draftState ?? initialState);
  const [isManualMode, setIsManualMode] = useState(false);
  const [useLivenessMode, setUseLivenessMode] = useState(false);
  
  const [stepMessage, setStepMessage] = useState<{ type: 'success' | 'error' | 'info'; title: string; description: string | React.ReactNode } | null>(null);
  
  // Only show prompt if it's a local draft without a URL draft ID. If URL has draftId, we auto-resume.
  const [showDraftPrompt, setShowDraftPrompt] = useState<boolean>(!!localDraft && !draftIdParam);

  const { mutate: saveToServer } = useSaveDraft();
  const { mutate: deleteFromServer } = useDeleteDraft();

  // If we load from server draft via URL, clear the param so it doesn't get stuck
  useEffect(() => {
    if (serverDraft && draftIdParam) {
      resumeDraft();
      router.replace('/account-opening/individual-savings');
    }
  }, [serverDraft, draftIdParam]);

  const currentIndex = STEPS.indexOf(currentStep);

  function next() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex]);
  }

  function previous() {
    if (currentIndex > 0) setCurrentStep(STEPS[currentIndex - 1]);
  }

  function goTo(step: WizardStep) {
    setCurrentStep(step);
  }

  function update(updates: Partial<IndividualSavingsFormState>) {
    setFormState((prev) => ({ ...prev, ...updates }));
    setStepMessage(null);
  }

  function switchToManual() {
    setIsManualMode(true);
    setUseLivenessMode(false);
    goTo('BIODATA_CONFIRMATION');
  }

  function switchToLiveness() {
    setUseLivenessMode(true);
    setIsManualMode(false);
  }

  function saveDraft() {
    const payload = { step: currentStep, state: formState };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    saveToServer({
      draftId: activeDraftIdRef.current,
      accountCategory: 'INDIVIDUAL',
      accountType: 'SAVINGS',
      draftData: payload,
    }, {
      onSuccess: (res) => { if (res?.id) updateActiveDraftId(res.id); }
    });
  }

  // Auto-save to localStorage only, with debounce
  useEffect(() => {
    if (formState.verificationId || currentStep !== 'IDENTITY_INPUT') {
      const timer = setTimeout(() => {
        const payload = { step: currentStep, state: formState };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      }, 1000); // 1-second debounce
      return () => clearTimeout(timer);
    }
  }, [currentStep, formState]);

  // Sync to server only when changing steps
  useEffect(() => {
    if (formState.verificationId || currentStep !== 'IDENTITY_INPUT') {
      const payload = { step: currentStep, state: formState };
      saveToServer({
        draftId: activeDraftIdRef.current,
        accountCategory: 'INDIVIDUAL',
        accountType: 'SAVINGS',
        draftData: payload,
      }, {
        onSuccess: (res) => { if (res?.id) updateActiveDraftId(res.id); }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Only trigger on step change, NOT on every keystroke

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    if (activeDraftId) {
      deleteFromServer(activeDraftId);
    }
  }

  function resumeDraft() {
    // Drop the user exactly where they left off instead of restarting
    if (draftStep) {
      setCurrentStep(draftStep as WizardStep);
    }
    // Form state is already loaded in the initial state of useState(draftState ?? initialState)
    setUseLivenessMode(false);
    setIsManualMode(false);
    setShowDraftPrompt(false);
  }

  function discardDraft() {
    clearDraft();
    setCurrentStep('IDENTITY_INPUT');
    setFormState({ ...initialState, clientReference: generateClientReference() });
    setUseLivenessMode(false);
    setIsManualMode(false);
    setShowDraftPrompt(false);
  }

  const hasDraft = (typeof window !== 'undefined' && !!localStorage.getItem(DRAFT_KEY)) || !!serverDraft;

  return {
    currentStep,
    currentIndex,
    formState,
    isManualMode,
    useLivenessMode,
    progressSteps: PROGRESS_STEPS,
    stepLabels: STEP_LABELS,
    hasDraft,
    showDraftPrompt,
    stepMessage,
    setStepMessage,
    clearStepMessage: () => setStepMessage(null),
    next,
    previous,
    goTo,
    update,
    switchToManual,
    switchToLiveness,
    saveDraft,
    clearDraft,
    resumeDraft,
    discardDraft,
  };
}
