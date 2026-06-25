'use client';

import { useState, useEffect } from 'react';
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
  
  // Find if we have a draft passed in URL
  const serverDraft = drafts?.find((d) => d.id === draftIdParam);
  
  // Local fallback for unsynced changes
  const localDraft = typeof window !== 'undefined' ? loadDraft() : null;
  const draftState = serverDraft?.draftData?.state ?? localDraft?.state;
  const draftStep = serverDraft?.draftData?.step ?? localDraft?.step;

  const [currentStep, setCurrentStep] = useState<WizardStep>(draftStep ?? 'IDENTITY_INPUT');
  const [formState, setFormState] = useState<IndividualSavingsFormState>(draftState ?? initialState);
  const [isManualMode, setIsManualMode] = useState(false);
  const [useLivenessMode, setUseLivenessMode] = useState(false);
  
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

  function goTo(step: WizardStep) {
    setCurrentStep(step);
  }

  function update(updates: Partial<IndividualSavingsFormState>) {
    setFormState((prev) => ({ ...prev, ...updates }));
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
      draftId: serverDraft?.id,
      accountCategory: 'INDIVIDUAL',
      accountType: 'SAVINGS',
      draftData: payload,
    });
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
    if (serverDraft?.id) {
      deleteFromServer(serverDraft.id);
    }
  }

  function resumeDraft() {
    // Reset verification session state — the old session will be expired/failed on the backend.
    // The user must re-do identity input to get a fresh session, but all other form data is preserved.
    setCurrentStep('IDENTITY_INPUT');
    setFormState((prev) => ({
      ...prev,
      verificationId: null,
      otpValue: '',
    }));
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
    next,
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
