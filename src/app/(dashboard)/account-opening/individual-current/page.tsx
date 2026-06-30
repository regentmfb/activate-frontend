'use client';

import { CreditCard } from 'lucide-react';
import { useIndividualCurrentWizard } from '@src/modules/account-opening/hooks/useIndividualCurrentWizard';
import { useInitiateAccount, useCancelAccountRequest, useRetryAccountRequest } from '@src/modules/account-opening/hooks/useAccountOpening';
import { AccountOpeningShell } from '@src/modules/account-opening/components/AccountOpeningShell';
import { IdentityInputStep } from '@src/modules/account-opening/components/steps/IdentityInputStep';
import { OtpVerificationStep } from '@src/modules/account-opening/components/steps/OtpVerificationStep';
import { BiodataConfirmationStep } from '@src/modules/account-opening/components/steps/BiodataConfirmationStep';
import { LivenessCheckStep } from '@src/modules/account-opening/liveness/LivenessCheckStep';
import { PhotoCaptureStep } from '@src/modules/account-opening/components/steps/PhotoCaptureStep';
import { ReferenceUploadStep } from '@src/modules/account-opening/components/steps/ReferenceUploadStep';
import { Tier1SuccessStep } from '@src/modules/account-opening/components/steps/Tier1SuccessStep';
import { Tier1FailedStep } from '@src/modules/account-opening/components/steps/Tier1FailedStep';
import { Tier2UpgradeStep } from '@src/modules/account-opening/components/steps/Tier2UpgradeStep';
import { Tier2SuccessStep } from '@src/modules/account-opening/components/steps/Tier2SuccessStep';
import { Tier2FailedStep } from '@src/modules/account-opening/components/steps/Tier2FailedStep';
import { Tier3UpgradeStep } from '@src/modules/account-opening/components/steps/Tier3UpgradeStep';
import { Tier3SuccessStep } from '@src/modules/account-opening/components/steps/Tier3SuccessStep';
import { Tier3FailedStep } from '@src/modules/account-opening/components/steps/Tier3FailedStep';
import { CompleteStep } from '@src/modules/account-opening/components/steps/CompleteStep';
import { CURRENT_STEP_DESCRIPTIONS, CURRENT_RESULT_STEPS, CURRENT_STEP_LABELS } from '@src/constants/labels';
import { IndividualSavingsFormState } from '@src/modules/account-opening/types/wizard.types';

export default function IndividualCurrentPage() {
  const {
    currentStep, currentIndex, formState, isManualMode, useLivenessMode, progressSteps, stepLabels,
    next, previous, goTo, update, switchToManual, switchToLiveness, saveDraft, clearDraft,
    showDraftPrompt, resumeDraft, discardDraft, stepMessage, setStepMessage, clearStepMessage,
  } = useIndividualCurrentWizard();

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
    goTo('PHOTO_CAPTURE');
  }

  function handleLivenessNext(data: Partial<typeof formState>) {
    update(data);
    goTo('BIODATA_CONFIRMATION');
  }

  function handlePhotoNext(data: Partial<typeof formState>) {
    update(data);
    submitAccount({ ...formState, ...data });
  }

  function handleReferenceNext(data: Partial<typeof formState>) {
    update(data);
    goTo('TIER1_SUCCESS');
  }

  function submitAccount(dataToSubmit: Partial<typeof formState>) {
    if (!formState.verificationId) return;
    initiateAccount(
      {
        verificationId: formState.verificationId,
        accountCategory: 'INDIVIDUAL',
        accountType: 'CURRENT',
        clientDraftId: formState.clientReference,
        idempotencyKey: formState.clientReference,
      },
      {
        onSuccess: (request) => {
          update({ ...dataToSubmit, accountRequestId: request.id, accountNumber: request.bankOneAccountNumber ?? null });
          goTo(request.status === 'FAILED' ? 'TIER1_FAILED' : 'REFERENCE_UPLOAD');
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
      retryRequest(formState.accountRequestId, { onSuccess: () => goTo('REFERENCE_UPLOAD') });
    } else {
      goTo('REFERENCE_UPLOAD');
    }
  }

  function handleCancel() {
    if (formState.accountRequestId) cancelRequest(formState.accountRequestId);
    clearDraft();
    goTo('IDENTITY_INPUT');
  }

  const isComplete = CURRENT_RESULT_STEPS.has(currentStep);
  // Shared state used by generic components expecting Savings shape
  const sharedFormState = formState as unknown as IndividualSavingsFormState;

  return (
    <AccountOpeningShell
      title="Individual Current"
      subtitle="Create Account"
      icon={<CreditCard className="h-4 w-4 text-[#920793]" />}
      clientReference={formState.clientReference}
      steps={progressSteps}
      currentStep={currentStep}
      stepLabels={CURRENT_STEP_LABELS}
      stepDescription={CURRENT_STEP_DESCRIPTIONS[currentStep] ?? ''}
      isComplete={isComplete}
      stepMessage={stepMessage as any}
      onClearStepMessage={clearStepMessage}
      onSaveDraft={saveDraft}
      onBack={currentIndex > 0 ? previous : undefined}
      showDraftPrompt={showDraftPrompt}
      onResumeDraft={resumeDraft}
      onDiscardDraft={discardDraft}
      onStepClick={(step) => goTo(step as any)}
    >
      {currentStep === 'IDENTITY_INPUT' && <IdentityInputStep formState={sharedFormState} onNext={handleIdentityNext} accountType="CURRENT" setStepMessage={setStepMessage} />}
      {currentStep === 'OTP_VERIFICATION' && (
        <OtpVerificationStep formState={sharedFormState} onNext={handleNext} onManual={switchToManual} onLiveness={switchToLiveness} setStepMessage={setStepMessage} />
      )}
      {currentStep === 'BIODATA_CONFIRMATION' && <BiodataConfirmationStep formState={sharedFormState} isManualMode={isManualMode} onNext={handleBiodataNext} setStepMessage={setStepMessage} />}
      {currentStep === 'PHOTO_CAPTURE' && (
        <PhotoCaptureStep formState={sharedFormState} onNext={handlePhotoNext} setStepMessage={setStepMessage} />
      )}
      {currentStep === 'REFERENCE_UPLOAD' && (
        <ReferenceUploadStep formState={formState as any} onNext={handleReferenceNext} isSubmitting={isSubmitting} setStepMessage={setStepMessage} />
      )}
      {currentStep === 'TIER1_SUCCESS' && <Tier1SuccessStep formState={sharedFormState} onUpgrade={() => goTo('TIER2_UPGRADE')} onFinish={() => { clearDraft(); goTo('COMPLETE'); }} onFailure={() => goTo('TIER1_FAILED')} />}
      {currentStep === 'TIER1_FAILED' && <Tier1FailedStep formState={sharedFormState} onRetry={handleRetry} onCancel={handleCancel} />}
      {currentStep === 'TIER2_UPGRADE' && <Tier2UpgradeStep formState={sharedFormState} onNext={handleTier2Next} />}
      {currentStep === 'TIER2_SUCCESS' && <Tier2SuccessStep formState={sharedFormState} onUpgrade={() => goTo('TIER3_UPGRADE')} onFinish={() => { clearDraft(); goTo('COMPLETE'); }} onFailure={() => goTo('TIER2_FAILED')} />}
      {currentStep === 'TIER2_FAILED' && <Tier2FailedStep formState={sharedFormState} onRetry={() => goTo('TIER2_UPGRADE')} />}
      {currentStep === 'TIER3_UPGRADE' && <Tier3UpgradeStep formState={sharedFormState} onNext={handleTier3Next} />}
      {currentStep === 'TIER3_SUCCESS' && <Tier3SuccessStep formState={sharedFormState} onFinish={() => { clearDraft(); goTo('COMPLETE'); }} onFailure={() => goTo('TIER3_FAILED')} />}
      {currentStep === 'TIER3_FAILED' && <Tier3FailedStep formState={sharedFormState} onRetry={() => goTo('TIER3_UPGRADE')} />}
      {currentStep === 'COMPLETE' && <CompleteStep formState={sharedFormState} />}
    </AccountOpeningShell>
  );
}
