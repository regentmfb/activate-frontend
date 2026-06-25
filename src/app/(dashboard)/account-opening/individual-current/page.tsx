'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useIndividualCurrentWizard } from '@src/modules/account-opening/hooks/useIndividualCurrentWizard';
import { useInitiateAccount, useCancelAccountRequest, useRetryAccountRequest } from '@src/modules/account-opening/hooks/useAccountOpening';
import { accountOpeningApi } from '@src/modules/account-opening/api/account-opening.api';
import { useSubmitLocationVerification } from '@src/modules/account-opening/hooks/useLocationVerification';
import { documentsApi } from '@src/modules/documents/api/documents.api';
import { AccountOpeningShell } from '@src/modules/account-opening/components/AccountOpeningShell';
import { IdentityInputStep } from '@src/modules/account-opening/components/steps/IdentityInputStep';
import { OtpVerificationStep } from '@src/modules/account-opening/components/steps/OtpVerificationStep';
import { BiodataConfirmationStep } from '@src/modules/account-opening/components/steps/BiodataConfirmationStep';
import { LivenessCheckStep } from '@src/modules/account-opening/liveness/LivenessCheckStep';
import { AdditionalInfoStep } from '@src/modules/account-opening/components/steps/AdditionalInfoStep';
import { PhotoCaptureStep } from '@src/modules/account-opening/components/steps/PhotoCaptureStep';
import { IDCardCaptureStep } from '@src/modules/account-opening/components/steps/IDCardCaptureStep';
import { LocationVerificationStep } from '@src/modules/account-opening/components/steps/LocationVerificationStep';
import { ReferenceUploadStep } from '@src/modules/account-opening/components/steps/ReferenceUploadStep';
import { CurrentSubmitSuccessStep } from '@src/modules/account-opening/components/steps/CurrentSubmitSuccessStep';
import { CurrentSubmitFailedStep } from '@src/modules/account-opening/components/steps/CurrentSubmitFailedStep';
import { CurrentCompleteStep } from '@src/modules/account-opening/components/steps/CurrentCompleteStep';
import { IndividualCurrentFormState, IndividualSavingsFormState } from '@src/modules/account-opening/types/wizard.types';
import { CURRENT_STEP_DESCRIPTIONS, CURRENT_STEP_LABELS, CURRENT_RESULT_STEPS } from '@src/constants/labels';

export default function IndividualCurrentPage() {
  const {
    currentStep, formState, isManualMode, useLivenessMode, progressSteps,
    next, goTo, update, switchToManual, switchToLiveness, saveDraft, clearDraft,
    showDraftPrompt, resumeDraft, discardDraft,
  } = useIndividualCurrentWizard();

  const { mutate: initiateAccount, isPending: isSubmitting, error: initiateError } = useInitiateAccount();
  const { mutate: cancelRequest } = useCancelAccountRequest();
  const { mutate: retryRequest } = useRetryAccountRequest();
  const { mutateAsync: submitLocationVerification } = useSubmitLocationVerification();
  const [isFinishingLocation, setIsFinishingLocation] = useState(false);

  function handleIdentityNext(data?: Partial<IndividualCurrentFormState>) {
    if (data) update(data);
    next();
  }

  function handleNext(data?: Partial<IndividualCurrentFormState>) {
    if (data) update(data);
    if (currentStep === 'ADDITIONAL_INFO' && useLivenessMode) {
      goTo('ID_CARD_CAPTURE');
      return;
    }
    if (currentStep === 'LOCATION_VERIFICATION') {
      const latestState = { ...formState, ...(data ?? {}) };
      if (!latestState.verificationId) {
        goTo('SUBMIT_FAILED');
        return;
      }
      setIsFinishingLocation(true);
      initiateAccount(
        {
          verificationId: latestState.verificationId,
          accountCategory: 'INDIVIDUAL',
          accountType: 'CURRENT',
          clientDraftId: latestState.clientReference,
          idempotencyKey: latestState.clientReference,
        },
        {
          onSuccess: async (request) => {
            update({ accountRequestId: request.id, accountNumber: request.bankOneAccountNumber ?? null });
            
            try {
              // 1. Upload all provided files
              let proofOfAddressDocumentId = '';
              let customerLocationImageId = '';

              console.log('[Current Wizard] Files in state:', {
                customerPhotoFile: !!latestState.customerPhotoFile,
                idCardPhotoFile: !!latestState.idCardPhotoFile,
                proofOfAddressFile: !!latestState.proofOfAddressFile,
                locationPhotoFile: !!latestState.locationPhotoFile,
                signatureFile: !!latestState.signatureFile,
                bvnNinEvidenceFile: !!latestState.bvnNinEvidenceFile,
              });

              // Upload customer passport photo — use File object if captured directly,
              // or fetch from the URL (blob/data URL) when carried over from liveness check.
              const customerPhotoUrl = latestState.customerPhotoUrl || latestState.livenessPhotoUrl;
              if (latestState.customerPhotoFile) {
                await documentsApi.upload({
                  file: latestState.customerPhotoFile,
                  activateRequestId: request.id,
                  documentType: 'passport_photo',
                  source: 'FIELD_CAPTURE',
                });
              } else if (customerPhotoUrl) {
                try {
                  const res = await fetch(customerPhotoUrl);
                  const blob = await res.blob();
                  const photoFile = new File([blob], 'customer_photo.jpg', { type: blob.type || 'image/jpeg' });
                  await documentsApi.upload({
                    file: photoFile,
                    activateRequestId: request.id,
                    documentType: 'passport_photo',
                    source: 'FIELD_CAPTURE',
                  });
                } catch (fetchErr) {
                  console.error('[Current Wizard] Failed to fetch customer photo from URL for upload:', fetchErr);
                }
              } else {
                console.warn('[Current Wizard] No customer photo available to upload as passport_photo.');
              }

              if (latestState.idCardPhotoFile) {
                await documentsApi.upload({
                  file: latestState.idCardPhotoFile,
                  activateRequestId: request.id,
                  documentType: 'valid_id',
                  source: 'FIELD_CAPTURE',
                });
              }

              if (latestState.proofOfAddressFile) {
                const proofDoc = await documentsApi.upload({
                  file: latestState.proofOfAddressFile,
                  activateRequestId: request.id,
                  documentType: 'utility_bill',
                  source: 'FIELD_CAPTURE',
                });
                proofOfAddressDocumentId = proofDoc.documentId;
              }

              if (latestState.locationPhotoFile) {
                const locationDoc = await documentsApi.upload({
                  file: latestState.locationPhotoFile,
                  activateRequestId: request.id,
                  documentType: 'LOCATION_PHOTO' as any,
                  source: 'FIELD_CAPTURE',
                });
                customerLocationImageId = locationDoc.documentId;
              }

              if (latestState.signatureFile) {
                await documentsApi.upload({
                  file: latestState.signatureFile,
                  activateRequestId: request.id,
                  documentType: 'signature',
                  source: 'FIELD_CAPTURE',
                });
              }

              if (latestState.bvnNinEvidenceFile) {
                await documentsApi.upload({
                  file: latestState.bvnNinEvidenceFile,
                  activateRequestId: request.id,
                  documentType: 'bvn_nin_verification_evidence',
                  source: 'FIELD_CAPTURE',
                });
              }

              // 2. Save the additional customer details (email, phone, secondary NIN, address) to the request
              const detailsPayload: any = {
                email: latestState.email,
                secondPhone: latestState.secondPhone,
                address: latestState.address,
              };
              if (latestState.secondaryIdMethod === 'NIN') {
                detailsPayload.nin = latestState.secondaryIdValue;
              } else if (latestState.secondaryIdMethod === 'BVN') {
                detailsPayload.bvn = latestState.secondaryIdValue;
              }
              await accountOpeningApi.updateDetails(request.id, detailsPayload);

              // 3. Submit location verification with real document UUIDs
              await submitLocationVerification({
                id: request.id,
                payload: {
                  address: latestState.address || 'Address captured',
                  proofOfAddressDocumentId,
                  customerLocationImageId,
                  isNearby: latestState.isProximityConfirmed ?? false,
                  rmLatitude: latestState.gpsCoords?.lat ?? 0,
                  rmLongitude: latestState.gpsCoords?.lng ?? 0,
                  customerLatitude: latestState.gpsCoords?.lat ?? 0,
                  customerLongitude: latestState.gpsCoords?.lng ?? 0,
                }
              });
              goTo('REFERENCE_UPLOAD');
            } catch (err) {
              console.error('Failed to submit location verification or upload documents', err);
              goTo('SUBMIT_FAILED');
            } finally {
              setIsFinishingLocation(false);
            }
          },
          onError: () => {
            setIsFinishingLocation(false);
            goTo('SUBMIT_FAILED');
          },
        }
      );
      return;
    }
    next();
  }

  function handleLivenessNext(data: Partial<IndividualCurrentFormState>) {
    update(data);
    goTo('BIODATA_CONFIRMATION');
  }

  function handleReferenceNext(data: Partial<IndividualCurrentFormState>) {
    update(data);
    if (formState.accountRequestId) {
      goTo('SUBMIT_SUCCESS');
    } else {
      goTo('SUBMIT_FAILED');
    }
  }
  function handleRetry() {
    if (formState.accountRequestId) {
      retryRequest(formState.accountRequestId, {
        onSuccess: () => goTo('REFERENCE_UPLOAD'),
      });
    } else {
      clearDraft();
      goTo('REFERENCE_UPLOAD');
    }
  }

  function handleCancel() {
    if (formState.accountRequestId) cancelRequest(formState.accountRequestId);
    clearDraft();
    goTo('IDENTITY_INPUT');
  }

  const isComplete = CURRENT_RESULT_STEPS.has(currentStep);
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
      onSaveDraft={saveDraft}
      showDraftPrompt={showDraftPrompt}
      onResumeDraft={resumeDraft}
      onDiscardDraft={discardDraft}
    >
      {currentStep === 'IDENTITY_INPUT' && (
        <IdentityInputStep formState={sharedFormState} onNext={handleIdentityNext} accountType="CURRENT" />
      )}
      {currentStep === 'OTP_VERIFICATION' && (
        <OtpVerificationStep formState={sharedFormState} onNext={handleNext} onManual={switchToManual} onLiveness={switchToLiveness} />
      )}
      {currentStep === 'BIODATA_CONFIRMATION' && (
        <BiodataConfirmationStep formState={sharedFormState} isManualMode={isManualMode} onNext={handleNext} />
      )}
      {currentStep === 'ADDITIONAL_INFO' && (
        <AdditionalInfoStep formState={formState} onNext={handleNext} />
      )}
      {currentStep === 'PHOTO_CAPTURE' && (
        useLivenessMode ? (
          <LivenessCheckStep formState={sharedFormState} onNext={handleLivenessNext} />
        ) : (
          <PhotoCaptureStep formState={sharedFormState} onNext={handleNext} />
        )
      )}
      {currentStep === 'ID_CARD_CAPTURE' && (
        <IDCardCaptureStep formState={formState} onNext={handleNext} />
      )}
      {currentStep === 'LOCATION_VERIFICATION' && (
        <LocationVerificationStep formState={formState} onNext={handleNext} isSubmitting={isSubmitting || isFinishingLocation} />
      )}
      {currentStep === 'REFERENCE_UPLOAD' && (
        <ReferenceUploadStep formState={formState} onNext={handleReferenceNext} isSubmitting={isSubmitting} />
      )}

      {currentStep === 'SUBMIT_SUCCESS' && (
        <CurrentSubmitSuccessStep formState={formState} />
      )}
      {currentStep === 'SUBMIT_FAILED' && (
        <CurrentSubmitFailedStep
          formState={formState}
          onRetry={handleRetry}
          onCancel={handleCancel}
        />
      )}

      {currentStep === 'COMPLETE' && <CurrentCompleteStep formState={formState} />}
    </AccountOpeningShell>
  );
}
