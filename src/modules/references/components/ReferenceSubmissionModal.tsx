'use client';

import { useState } from 'react';
import { X, Users, CheckCircle, AlertCircle, Upload, FileText } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ReferenceForm } from './ReferenceForm';
import { useSubmitReferences } from '../hooks/useReferences';
import { createEmptyReference } from '../utils/reference-validation';
import { DocumentUploadModal } from '@/src/modules/documents/components/DocumentUploadModal';
import type { ReferenceFormData } from '../types/references.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess?: (references: Array<{ fullName: string; bankName: string }>) => void;
};

export function ReferenceSubmissionModal({ isOpen, onClose, accountId, onSuccess }: Props) {
  const [mode, setMode] = useState<'unified' | 'manual'>('unified');
  const [references, setReferences] = useState<ReferenceFormData[]>([createEmptyReference()]);
  const [unifiedDocumentUrl, setUnifiedDocumentUrl] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  
  const submitMutation = useSubmitReferences();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (mode === 'unified') {
        await submitMutation.mutateAsync({
          accountId,
          payload: { documentUrl: unifiedDocumentUrl }
        });
        onSuccess?.([{ fullName: 'Referee Package (Unified Form)', bankName: 'Core Processed' }]);
        setSubmittedCount(1);
      } else {
        await submitMutation.mutateAsync({
          accountId,
          payload: { references }
        });
        onSuccess?.(references.map(r => ({ fullName: r.fullName, bankName: r.bankName })));
        setSubmittedCount(references.length);
      }
      setIsSuccessState(true);
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReferences([createEmptyReference()]);
      setUnifiedDocumentUrl('');
      setMode('unified');
      setIsSuccessState(false);
      onClose();
    }
  };

  const isFormValid = () => {
    if (mode === 'unified') {
      return !!unifiedDocumentUrl.trim();
    }

    if (references.length === 0) return false;
    const result = references.every(ref => {
      const checks = {
        fullName: !!ref.fullName?.trim(),
        bankName: !!ref.bankName?.trim(),
        accountNumber: ref.accountNumber?.trim().length === 10,
        email: !ref.email?.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email.trim()),
        phoneNumber: !ref.phoneNumber?.trim() || ref.phoneNumber?.trim().length >= 10,
        documentUrl: !!ref.documentUrl?.trim(), // Document URL is required
      };
      return Object.values(checks).every(Boolean);
    });
    return result;
  };

  const hasCompleteReferences = references.every(ref => 
    ref.fullName && ref.bankName && ref.accountNumber && ref.documentUrl
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              {isSuccessState ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Users className="w-5 h-5 text-[#920793]" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isSuccessState ? 'Submission Successful' : 'Submit References'}
              </h2>
              <p className="text-sm text-gray-500">
                {isSuccessState 
                  ? 'Reference details have been recorded' 
                  : 'Provide referee details for current account opening'}
              </p>
            </div>
          </div>
          {!isSubmitting && (
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {isSuccessState ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center">
            <div className="w-full max-w-md space-y-6">
              <div className="flex items-center gap-3 justify-center mb-6">
                <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-[17px] font-bold text-gray-900">References Submitted! 🎉</p>
                  <p className="text-[13px] text-gray-500">{submittedCount} reference{submittedCount !== 1 && 's'} successfully submitted.</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg border border-gray-100 divide-y divide-gray-100">
                {[
                  ['Request ID', accountId.slice(0, 8).toUpperCase()],
                  ['Submission Type', mode === 'unified' ? 'Unified Scanned Form' : 'Manual Entry'],
                  ['Status', 'Pending Verification'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3 text-[13px]">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-semibold text-gray-900 truncate ml-4 text-right">{v}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-amber-800">Pending Operations Review</p>
                  <p className="text-[12px] text-amber-700 mt-0.5 leading-relaxed">
                    Operations will verify the submitted reference details within 24 hours on a business day. You will be notified once complete.
                  </p>
                </div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full h-11 rounded-lg text-white font-semibold bg-[#920793] hover:bg-[#920793]/90 mt-4"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Toggle */}
            <div className="flex border-b border-gray-100 px-6 shrink-0 bg-gray-50/50">
              <button
                onClick={() => !isSubmitting && setMode('unified')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                  mode === 'unified'
                    ? 'border-[#920793] text-[#920793]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                disabled={isSubmitting}
              >
                Unified Scanned Form
              </button>
              <button
                onClick={() => !isSubmitting && setMode('manual')}
                className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors ${
                  mode === 'manual'
                    ? 'border-[#920793] text-[#920793]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                disabled={isSubmitting}
              >
                Manual Referee Entry
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {mode === 'unified' ? (
                <div className="space-y-6">
                  <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-8 text-center">
                    <FileText className="w-12 h-12 text-[#920793] mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Upload Scanned Reference Form</h3>
                    <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
                      Upload a single scanned document containing all referee information. The operations team will extract and verify individual details.
                    </p>
                    {unifiedDocumentUrl ? (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl max-w-lg mx-auto">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <div className="text-left">
                            <p className="text-sm font-semibold text-green-900">Document Uploaded Successfully</p>
                            <p className="text-xs text-green-700 truncate max-w-[200px] sm:max-w-xs">{unifiedDocumentUrl}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowUploadModal(true)}
                          variant="outline"
                          size="sm"
                          disabled={isSubmitting}
                        >
                          Replace File
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => setShowUploadModal(true)}
                        disabled={isSubmitting}
                        className="bg-[#920793] hover:opacity-90 text-white"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Scanned Document
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <ReferenceForm
                  references={references}
                  onChange={setReferences}
                  activateRequestId={accountId}
                  disabled={isSubmitting}
                />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-6 shrink-0">
              {/* Summary */}
              {mode === 'manual' && (
                <>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">References to submit:</span>
                      <span className="font-medium text-gray-900">{references.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-600">Complete references:</span>
                      <span className={`font-medium ${hasCompleteReferences ? 'text-green-600' : 'text-amber-600'}`}>
                        {references.filter(ref => 
                          ref.fullName && ref.bankName && ref.accountNumber && ref.documentUrl
                        ).length} of {references.length}
                      </span>
                    </div>
                  </div>

                  {/* Validation Status */}
                  {references.length > 0 && (
                    <div className="mb-4">
                      {isFormValid() ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>All references are complete and ready for submission</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>Please complete all required fields before submitting</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {mode === 'unified' && (
                <div className="mb-4">
                  {unifiedDocumentUrl ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      <span>Scanned form is uploaded and ready for submission</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>Please upload a scanned reference form document before submitting</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className="flex-1 bg-[#920793] hover:bg-[#920793]/90 text-white"
                >
                  {isSubmitting
                    ? 'Submitting References...'
                    : mode === 'unified'
                    ? 'Submit Scanned Form'
                    : `Submit ${references.length} Reference${references.length > 1 ? 's' : ''}`}
                </Button>
              </div>

              {/* Info note */}
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-900">
                  <strong>Note:</strong> Once submitted, these references will be sent to Operations for validation. 
                  You will be notified of the review outcome, and any rejected references will create corrective tasks.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        activateRequestId={accountId}
        documentType="REFERENCE_FORM"
        title="Upload Scanned Reference Form"
        description="Upload the unified scanned document containing all referee information"
        onSuccess={(result) => {
          const url = result?.fileUrl ?? result?.url ?? result?.documentUrl ?? '';
          setUnifiedDocumentUrl(url);
          setShowUploadModal(false);
        }}
      />
    </div>
  );
}