'use client';

import { PiggyBank } from 'lucide-react';
import { useIndividualSavingsWizard } from '@src/modules/account-opening/hooks/useIndividualSavingsWizard';
import { useInitiateAccount, useCancelAccountRequest, useRetryAccountRequest } from '@src/modules/account-opening/hooks/useAccountOpening';
import { AccountOpeningShell } from '@src/modules/account-opening/components/AccountOpeningShell';
import { IdentityInputStep } from '@src/modules/account-opening/components/steps/IdentityInputStep';
import { OtpVerificationStep } from '@src/modules/account-opening/components/steps/OtpVerificationStep';
import { BiodataConfirmationStep } from '@src/modules/account-opening/components/steps/BiodataConfirmationStep';
import { LivenessCheckStep } from '@src/modules/account-opening/liveness/LivenessCheckStep';
import { PhotoCaptureStep } from '@src/modules/account-opening/components/steps/PhotoCaptureStep';
import { Tier1SuccessStep } from '@src/modules/account-opening/components/steps/Tier1SuccessStep';
import { Tier1FailedStep } from '@src/modules/account-opening/components/steps/Tier1FailedStep';
import { Tier2UpgradeStep } from '@src/modules/account-opening/components/steps/Tier2UpgradeStep';
import { Tier2SuccessStep } from '@src/modules/account-opening/components/steps/Tier2SuccessStep';
import { Tier2FailedStep } from '@src/modules/account-opening/components/steps/Tier2FailedStep';
import { Tier3UpgradeStep } from '@src/modules/account-opening/components/steps/Tier3UpgradeStep';
import { Tier3SuccessStep } from '@src/modules/account-opening/components/steps/Tier3SuccessStep';
import { Tier3FailedStep } from '@src/modules/account-opening/components/steps/Tier3FailedStep';
import { CompleteStep } from '@src/modules/account-opening/components/steps/CompleteStep';
import { SAVINGS_STEP_DESCRIPTIONS, SAVINGS_RESULT_STEPS } from '@src/constants/labels';

export default function IndividualSavingsPage() {
  const {
    currentStep, formState, isManualMode, useLivenessMode, progressSteps, stepLabels,
    next, goTo, update, switchToManual, switchToLiveness, saveDraft, clearDraft,
    showDraftPrompt, resumeDraft, discardDraft,
  } = useIndividualSavingsWizard();

  const { mutate: initiateAccount, isPending: isSubmitting, error: initiateError } = useInitiateAccount();
  const { mutate: cancelRequest } = useCancelAccountRequest();
  const { mutate: retryRequest } = useRetryAccountRequest();

  function handleIdentityNext(data?: Partial<typeof formState>) {
    if (data) update(data);
    next();
  }

  function handleNext(data?: Partial<typeof formState>) {
    if (data) update(data);
    next();
  }

  function handleBiodataNext(data: Partial<typeof formState>) {
    update(data);
    if (useLivenessMode) {
      submitAccount({ customerPhotoUrl: formState.customerPhotoUrl });
      return;
    }
    next();
  }

  function handleLivenessNext(data: Partial<typeof formState>) {
    update(data);
    goTo('BIODATA_CONFIRMATION');
  }

  function handlePhotoNext(data: Partial<typeof formState>) {
    update(data);
    submitAccount(data);
  }

  function submitAccount(photoData: Partial<typeof formState>) {
    if (!formState.verificationId) return;
    initiateAccount(
      {
        verificationId: formState.verificationId,
        accountCategory: 'INDIVIDUAL',
        accountType: 'SAVINGS',
        clientDraftId: formState.clientReference,
        idempotencyKey: formState.clientReference,
      },
      {
        onSuccess: (request) => {
          update({ ...photoData, accountRequestId: request.id, accountNumber: request.bankOneAccountNumber ?? null });
          goTo(request.status === 'FAILED' ? 'TIER1_FAILED' : 'TIER1_SUCCESS');
        },
        onError: () => goTo('TIER1_FAILED'),
      }
    );
  }

  function handleTier2Next(data: Partial<typeof formState>) {
    update(data);
    goTo('TIER2_SUCCESS');
  }

  function handleTier3Next(data: Partial<typeof formState>) {
    update(data);
    goTo('TIER3_SUCCESS');
  }

  function handleRetry() {
    if (formState.accountRequestId) {
      retryRequest(formState.accountRequestId, { onSuccess: () => goTo('PHOTO_CAPTURE') });
    } else {
      goTo('PHOTO_CAPTURE');
    }
  }

  function handleCancel() {
    if (formState.accountRequestId) cancelRequest(formState.accountRequestId);
    clearDraft();
    goTo('IDENTITY_INPUT');
  }

  const isComplete = SAVINGS_RESULT_STEPS.has(currentStep);

  return (
    <AccountOpeningShell
      title="Individual Savings"
      subtitle="Create Account"
      icon={<PiggyBank className="h-4 w-4 text-[#920793]" />}
      clientReference={formState.clientReference}
      steps={progressSteps}
      currentStep={currentStep}
      stepLabels={stepLabels}
      stepDescription={SAVINGS_STEP_DESCRIPTIONS[currentStep] ?? ''}
      isComplete={isComplete}
      onSaveDraft={saveDraft}
      showDraftPrompt={showDraftPrompt}
      onResumeDraft={resumeDraft}
      onDiscardDraft={discardDraft}
    >
      {currentStep === 'IDENTITY_INPUT' && <IdentityInputStep formState={formState} onNext={handleIdentityNext} accountType="SAVINGS" />}
      {currentStep === 'OTP_VERIFICATION' && (
        <OtpVerificationStep formState={formState} onNext={handleNext} onManual={switchToManual} onLiveness={switchToLiveness} />
      )}
      {currentStep === 'BIODATA_CONFIRMATION' && <BiodataConfirmationStep formState={formState} isManualMode={isManualMode} onNext={handleBiodataNext} />}
      {currentStep === 'PHOTO_CAPTURE' && (
        useLivenessMode ? (
          <LivenessCheckStep formState={formState} onNext={handleLivenessNext} />
        ) : (
          <PhotoCaptureStep formState={formState} onNext={handlePhotoNext} isSubmitting={isSubmitting} />
        )
      )}
      {currentStep === 'TIER1_SUCCESS' && <Tier1SuccessStep formState={formState} onUpgrade={() => goTo('TIER2_UPGRADE')} onFinish={() => { clearDraft(); goTo('COMPLETE'); }} onFailure={() => goTo('TIER1_FAILED')} />}
      {currentStep === 'TIER1_FAILED' && <Tier1FailedStep formState={formState} onRetry={handleRetry} onCancel={handleCancel} />}
      {currentStep === 'TIER2_UPGRADE' && <Tier2UpgradeStep formState={formState} onNext={handleTier2Next} />}
      {currentStep === 'TIER2_SUCCESS' && <Tier2SuccessStep formState={formState} onUpgrade={() => goTo('TIER3_UPGRADE')} onFinish={() => { clearDraft(); goTo('COMPLETE'); }} onFailure={() => goTo('TIER2_FAILED')} />}
      {currentStep === 'TIER2_FAILED' && <Tier2FailedStep formState={formState} onRetry={() => goTo('TIER2_UPGRADE')} />}
      {currentStep === 'TIER3_UPGRADE' && <Tier3UpgradeStep formState={formState} onNext={handleTier3Next} />}
      {currentStep === 'TIER3_SUCCESS' && <Tier3SuccessStep formState={formState} onFinish={() => { clearDraft(); goTo('COMPLETE'); }} onFailure={() => goTo('TIER3_FAILED')} />}
      {currentStep === 'TIER3_FAILED' && <Tier3FailedStep formState={formState} onRetry={() => goTo('TIER3_UPGRADE')} />}
      {currentStep === 'COMPLETE' && <CompleteStep formState={formState} />}
    </AccountOpeningShell>
  );
}
