'use client';

import { useState } from 'react';
import { X, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ReferenceForm } from './ReferenceForm';
import { useSubmitReferences } from '../hooks/useReferences';
import { validateReferences, hasValidationErrors, createEmptyReference } from '../utils/reference-validation';
import type { ReferenceFormData } from '../types/references.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
  onSuccess?: (references: Array<{ fullName: string; bankName: string }>) => void;
};

export function ReferenceSubmissionModal({ isOpen, onClose, accountId, onSuccess }: Props) {
  const [references, setReferences] = useState<ReferenceFormData[]>([createEmptyReference()]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitMutation = useSubmitReferences();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        accountId,
        payload: { references }
      });
      onSuccess?.(references.map(r => ({ fullName: r.fullName, bankName: r.bankName })));
      handleClose();
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReferences([createEmptyReference()]);
      onClose();
    }
  };

  const isFormValid = () => {
    if (references.length === 0) return false;
    const result = references.every(ref => {
      const checks = {
        fullName: !!ref.fullName?.trim(),
        bankName: !!ref.bankName?.trim(),
        accountNumber: ref.accountNumber?.trim().length === 10,
        email: !!ref.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email.trim()),
        phoneNumber: ref.phoneNumber?.trim().length === 11,
      };
      console.log('[isFormValid] ref checks:', checks, 'ref:', ref);
      return Object.values(checks).every(Boolean);
    });
    return result;
  };

  const hasCompleteReferences = references.every(ref => 
    ref.fullName && ref.bankName && ref.accountNumber && ref.email && ref.phoneNumber
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Submit References</h2>
              <p className="text-sm text-gray-500">Add referee details for current account opening</p>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ReferenceForm
            references={references}
            onChange={setReferences}
            activateRequestId={accountId}
            disabled={isSubmitting}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 shrink-0">
          {/* Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">References to submit:</span>
              <span className="font-medium text-gray-900">{references.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Complete references:</span>
              <span className={`font-medium ${hasCompleteReferences ? 'text-green-600' : 'text-amber-600'}`}>
                {references.filter(ref => 
                  ref.fullName && ref.bankName && ref.accountNumber && ref.email && ref.phoneNumber
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
              className="flex-1"
            >
              {isSubmitting ? 'Submitting References...' : `Submit ${references.length} Reference${references.length > 1 ? 's' : ''}`}
            </Button>
          </div>

          {/* Info note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Once submitted, these references will be sent to Operations for validation. 
              You will be notified of the review outcome, and any rejected references will create corrective tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}