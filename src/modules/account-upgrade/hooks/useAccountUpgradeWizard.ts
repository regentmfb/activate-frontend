'use client';

import { useState } from 'react';
import { generateClientReference } from '@src/utils';

export type UpgradeStep =
  | 'SELECT_TIER'
  | 'TIER2_UPGRADE'
  | 'TIER3_UPGRADE'
  | 'COMPLETE';

export type UpgradeFormState = {
  clientReference: string;
  accountNumber: string;
  currentTier: number;
  targetTier: number;
  // Tier 2
  secondaryIdMethod: 'BVN' | 'NIN' | null;
  secondaryIdValue: string;
  idCardPhotoUrl: string | null;
  // Tier 3
  isProximityConfirmed: boolean | null;
  address: string;
  proofOfAddressUrl: string | null;
  locationPhotoUrl: string | null;
  gpsCoords: { lat: number; lng: number } | null;
};

export function useAccountUpgradeWizard(accountNumber: string, currentTier: number) {
  const startStep: UpgradeStep = currentTier === 1 ? 'TIER2_UPGRADE' : currentTier === 2 ? 'TIER3_UPGRADE' : 'SELECT_TIER';

  const [currentStep, setCurrentStep] = useState<UpgradeStep>(startStep);
  const [formState, setFormState] = useState<UpgradeFormState>({
    clientReference: generateClientReference(),
    accountNumber,
    currentTier,
    targetTier: currentTier + 1,
    secondaryIdMethod: null,
    secondaryIdValue: '',
    idCardPhotoUrl: null,
    isProximityConfirmed: null,
    address: '',
    proofOfAddressUrl: null,
    locationPhotoUrl: null,
    gpsCoords: null,
  });

  function update(updates: Partial<UpgradeFormState>) {
    setFormState((prev) => ({ ...prev, ...updates }));
  }

  function goTo(step: UpgradeStep) {
    setCurrentStep(step);
  }

  function next() {
    if (currentStep === 'TIER2_UPGRADE') {
      if (formState.currentTier === 1) {
        setCurrentStep('COMPLETE');
      } else {
        setCurrentStep('TIER3_UPGRADE');
      }
    } else if (currentStep === 'TIER3_UPGRADE') {
      setCurrentStep('COMPLETE');
    }
  }

  const steps: UpgradeStep[] = currentTier === 1
    ? ['TIER2_UPGRADE', 'COMPLETE']
    : ['TIER3_UPGRADE', 'COMPLETE'];

  const stepLabels: Record<UpgradeStep, string> = {
    SELECT_TIER: 'Select',
    TIER2_UPGRADE: 'Tier 2',
    TIER3_UPGRADE: 'Tier 3',
    COMPLETE: 'Done',
  };

  return { currentStep, formState, steps, stepLabels, update, goTo, next };
}
