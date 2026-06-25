'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { generateClientReference } from '@src/utils';
import { CurrentWizardStep, IndividualCurrentFormState } from '../types/wizard.types';
import { CURRENT_STEP_LABELS } from '@src/constants/labels';
import { useSaveDraft, useDeleteDraft, useGetDrafts } from '@src/modules/drafts/api/drafts.api';

const STEP_LABELS = CURRENT_STEP_LABELS;

const STEPS: CurrentWizardStep[] = [
  'IDENTITY_INPUT',
  'OTP_VERIFICATION',
  'BIODATA_CONFIRMATION',
  'ADDITIONAL_INFO',
  'PHOTO_CAPTURE',
  'ID_CARD_CAPTURE',
  'LOCATION_VERIFICATION',
  'REFERENCE_UPLOAD',
  'SUBMIT_SUCCESS',
  'SUBMIT_FAILED',
  'COMPLETE',
];

const PROGRESS_STEPS: CurrentWizardStep[] = [
  'IDENTITY_INPUT',
  'OTP_VERIFICATION',
  'BIODATA_CONFIRMATION',
  'ADDITIONAL_INFO',
  'PHOTO_CAPTURE',
  'ID_CARD_CAPTURE',
  'LOCATION_VERIFICATION',
  'REFERENCE_UPLOAD',
];

const DRAFT_KEY = 'activate_current_draft';

const initialState: IndividualCurrentFormState = {
  clientReference: generateClientReference(),
  verificationMethod: 'BVN',
  firstName: '',
  lastName: '',
  identityValue: '',
  otpValue: '',
  verificationId: null,
  biodata: null,
  email: '',
  secondPhone: '',
  secondaryIdMethod: null,
  secondaryIdValue: '',
  address: '',
  customerPhotoUrl: null,
  customerPhotoFile: null,
  livenessPhotoUrl: null,
  idCardPhotoUrl: null,
  idCardPhotoFile: null,
  signatureFile: null,
  bvnNinEvidenceFile: null,
  isProximityConfirmed: null,
  proofOfAddressUrl: null,
  locationPhotoUrl: null,
  proofOfAddressFile: null,
  locationPhotoFile: null,
  gpsCoords: null,
  referenceFormUrl: null,
  accountRequestId: null,
  accountNumber: null,
};

function loadDraft(): { step: CurrentWizardStep; state: IndividualCurrentFormState } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useIndividualCurrentWizard() {
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

  const [currentStep, setCurrentStep] = useState<CurrentWizardStep>(draftStep ?? 'IDENTITY_INPUT');
  const [formState, setFormState] = useState<IndividualCurrentFormState>(draftState ?? initialState);
  const [isManualMode, setIsManualMode] = useState(false);
  const [useLivenessMode, setUseLivenessMode] = useState(false);
  
  // Only show prompt if it's a local draft without a URL draft ID
  const [showDraftPrompt, setShowDraftPrompt] = useState<boolean>(!!localDraft && !draftIdParam);

  const { mutate: saveToServer } = useSaveDraft();
  const { mutate: deleteFromServer } = useDeleteDraft();

  // If we load from server draft via URL, clear the param
  useEffect(() => {
    if (serverDraft && draftIdParam) {
      resumeDraft();
      router.replace('/account-opening/individual-current');
    }
  }, [serverDraft, draftIdParam]);

  const currentIndex = STEPS.indexOf(currentStep);

  function next() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) setCurrentStep(STEPS[nextIndex]);
  }

  function goTo(step: CurrentWizardStep) {
    setCurrentStep(step);
  }

  function update(updates: Partial<IndividualCurrentFormState>) {
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
      accountType: 'CURRENT',
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
