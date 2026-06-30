'use client';

import { useState } from 'react';
import { CheckCircle, Users, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ReferenceSubmissionModal, ReferenceResubmissionModal } from '@/src/modules/references';
import { useReferencesByAccountId } from '@/src/modules/references/hooks/useReferences';
import { REFERENCE_STATUS_LABELS } from '@/src/constants/labels';
import { cn } from '@/src/utils';
import type { IndividualCurrentFormState } from '../../types/wizard.types';

type Props = {
  formState: IndividualCurrentFormState;
  onNext: (data: Partial<IndividualCurrentFormState>) => void;
  isSubmitting?: boolean;
  setStepMessage?: (msg: { type: 'success' | 'error' | 'info'; title: string; description: string }) => void;
};

export function ReferenceUploadStep({ formState, onNext, isSubmitting, setStepMessage }: Props) {
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showResubmitModal, setShowResubmitModal] = useState(false);
  const [selectedRefForResubmit, setSelectedRefForResubmit] = useState<any>(null);
  
  // Local submitted references — shown immediately after submit since GET endpoint may not exist yet
  const [localReferences, setLocalReferences] = useState<Array<{ fullName: string; bankName: string; status: 'PENDING' }>>([]);
  
  // Try to get references from API (may 404 — handled gracefully)
  const { data: apiReferences = [] } = useReferencesByAccountId(
    formState.accountRequestId || ''
  );

  // Merge: prefer API data if available, fall back to local
  const references = apiReferences.length > 0 ? apiReferences : localReferences;
  const hasReferences = references.length > 0;
  const allReferencesApproved = references.length > 0 && references.every(ref => ref.status === 'PASSED');
  const hasRejectedReferences = references.some(ref => ref.status === 'FAILED');

  const handleSubmitReferences = () => {
    if (!formState.accountRequestId) return;
    setShowSubmissionModal(true);
  };

  const handleReferencesSubmitted = (submittedRefs?: Array<{ fullName: string; bankName: string }>) => {
    setShowSubmissionModal(false);
    if (submittedRefs?.length) {
      setLocalReferences(submittedRefs.map(r => ({ ...r, status: 'PENDING' as const })));
    }
  };

  const canProceed = hasReferences;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[14px] font-bold text-gray-900">Reference Forms</p>
        <p className="text-[12px] text-gray-500 mt-0.5">
          Submit referee details and forms for your current account opening
        </p>
      </div>

      {/* References Status */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        {!hasReferences ? (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-[13px] font-semibold text-gray-900 mb-1">No References Submitted</p>
            <p className="text-[12px] text-gray-600 mb-3">
              Current accounts require referee forms for approval.
            </p>
            <Button
              onClick={handleSubmitReferences}
              disabled={!formState.accountRequestId}
              size="sm"
              className="bg-[#920793] hover:opacity-90 text-white text-[12px] h-8"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add References
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold text-gray-900">Submitted References</p>
              <Button
                onClick={handleSubmitReferences}
                variant="outline"
                size="sm"
                className="text-[11px] h-7 text-[#920793] border-[#920793]/30 hover:bg-[#920793]/5"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add More
              </Button>
            </div>

            <div className="space-y-2">
              {references.map((reference, idx) => {
                const isPlaceholder = reference.bankName === 'Pending Review';
                const displayName = isPlaceholder ? reference.fullName.replace(' (Pending Review)', '') : reference.fullName;
                const displayBank = isPlaceholder ? 'Pending Extraction from Form' : reference.bankName;

                return (
                <div
                  key={'id' in reference ? reference.id : idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-[12px] font-medium text-gray-900">{displayName}</p>
                    <p className="text-[11px] text-gray-600">
                      {displayBank}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {reference.status === 'FAILED' && 'id' in reference && (
                      <Button
                        onClick={() => {
                          setSelectedRefForResubmit(reference);
                          setShowResubmitModal(true);
                        }}
                        size="sm"
                        variant="outline"
                        className="text-[10px] h-6 px-2 text-[#920793] border-purple-200 hover:bg-purple-50"
                      >
                        Resubmit
                      </Button>
                    )}
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        reference.status === 'PASSED' && 'bg-green-100 text-green-700',
                        reference.status === 'FAILED' && 'bg-red-100 text-red-700',
                        reference.status === 'PENDING' && 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {REFERENCE_STATUS_LABELS[reference.status]}
                    </span>
                    {reference.status === 'PASSED' && (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    )}
                  </div>
                </div>
                );
              })}
            </div>

            {/* Status Summary */}
            <div className="mt-4 p-3 rounded-lg border">
              {allReferencesApproved ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <div>
                    <p className="text-[12px] font-medium">All references approved!</p>
                    <p className="text-[11px] text-green-600">Ready to complete account opening.</p>
                  </div>
                </div>
              ) : hasRejectedReferences ? (
                <div className="text-amber-700">
                  <p className="text-[12px] font-medium">Some references need attention</p>
                  <p className="text-[11px] text-amber-600">
                    Click "Resubmit" to fix rejected references.
                  </p>
                </div>
              ) : (
                <div className="text-blue-700">
                  <p className="text-[12px] font-medium">References under review</p>
                  <p className="text-[11px] text-blue-600">
                    Being validated by operations team.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={!canProceed || isSubmitting}
        onClick={() => onNext({ referenceFormUrl: 'completed' })}
        className="w-full h-9 rounded-lg text-white text-[13px] font-semibold bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {isSubmitting ? 'Submitting…' : canProceed ? 'Finish Onboarding' : 'Waiting for Reference Submission'}
      </button>

      {/* Informative status card when references are pending review */}
      {hasReferences && !allReferencesApproved && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
          <p className="text-[13px] font-semibold text-blue-800">References Submitted Successfully</p>
          <p className="text-[12px] text-blue-700 mt-1">
            The referee documents have been uploaded and submitted for Operations validation. You can now complete the onboarding flow by clicking "Finish Onboarding" above.
          </p>
        </div>
      )}

      {/* Reference Submission Modal */}
      <ReferenceSubmissionModal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        accountId={formState.accountRequestId || ''}
        onSuccess={(refs) => handleReferencesSubmitted(refs)}
      />

      {/* Reference Resubmission Modal */}
      {showResubmitModal && selectedRefForResubmit && (
        <ReferenceResubmissionModal
          isOpen={showResubmitModal}
          onClose={() => {
            setShowResubmitModal(false);
            setSelectedRefForResubmit(null);
          }}
          referenceId={selectedRefForResubmit.id}
          initialData={{
            fullName: selectedRefForResubmit.fullName,
            bankName: selectedRefForResubmit.bankName,
            accountNumber: selectedRefForResubmit.accountNumber || '',
            phoneNumber: selectedRefForResubmit.phoneNumber || '',
            email: selectedRefForResubmit.email || '',
            documentUrl: selectedRefForResubmit.documentUrl || '',
          }}
          activateRequestId={formState.accountRequestId || ''}
        />
      )}
    </div>
  );
}