'use client';

import { useState } from 'react';
import { generateClientReference } from '@src/utils';
import { WizardStep, IndividualSavingsFormState } from '../types/wizard.types';
import { SAVINGS_STEP_LABELS } from '@src/constants/labels';

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
  const draft = typeof window !== 'undefined' ? loadDraft() : null;

  const [currentStep, setCurrentStep] = useState<WizardStep>(draft?.step ?? 'IDENTITY_INPUT');
  const [formState, setFormState] = useState<IndividualSavingsFormState>(draft?.state ?? initialState);
  const [isManualMode, setIsManualMode] = useState(false);
  const [useLivenessMode, setUseLivenessMode] = useState(false);
  // If a draft exists, show the resume prompt until the user decides
  const [showDraftPrompt, setShowDraftPrompt] = useState<boolean>(!!draft);

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
  }

  function clearDraft() {
    localStorage.removeItem(DRAFT_KEY);
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

  const hasDraft = typeof window !== 'undefined' && !!localStorage.getItem(DRAFT_KEY);

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
