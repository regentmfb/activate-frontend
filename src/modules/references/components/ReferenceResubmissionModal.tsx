'use client';

import { useState } from 'react';
import { X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ReferenceForm } from './ReferenceForm';
import { useResubmitReference } from '../hooks/useReferences';
import type { ReferenceFormData } from '../types/references.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  initialData: {
    fullName: string;
    bankName: string;
    accountNumber: string;
    phoneNumber: string;
    email: string;
    documentUrl?: string;
  };
  activateRequestId: string;
  onSuccess?: () => void;
};

export function ReferenceResubmissionModal({
  isOpen,
  onClose,
  referenceId,
  initialData,
  activateRequestId,
  onSuccess,
}: Props) {
  const [references, setReferences] = useState<ReferenceFormData[]>([
    {
      fullName: initialData.fullName,
      bankName: initialData.bankName,
      accountNumber: initialData.accountNumber,
      phoneNumber: initialData.phoneNumber,
      email: initialData.email,
      documentUrl: initialData.documentUrl || '',
    },
  ]);

  const resubmitMutation = useResubmitReference();

  const handleSubmit = async () => {
    try {
      await resubmitMutation.mutateAsync({
        referenceId,
        payload: references[0],
      });
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  const isFormValid = () => {
    const ref = references[0];
    const checks = {
      fullName: !!ref.fullName?.trim(),
      bankName: !!ref.bankName?.trim(),
      accountNumber: ref.accountNumber?.trim().length === 10,
      email: !!ref.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ref.email.trim()),
      phoneNumber: ref.phoneNumber?.trim().length === 11,
      documentUrl: !!ref.documentUrl?.trim(),
    };
    return Object.values(checks).every(Boolean);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#920793]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Resubmit Reference</h2>
              <p className="text-sm text-gray-500">Correct the details and upload a valid form</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ReferenceForm
            references={references}
            onChange={setReferences}
            activateRequestId={activateRequestId}
            disabled={resubmitMutation.isPending}
            maxReferences={1}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-6 shrink-0">
          {/* Validation Status */}
          <div className="mb-4">
            {isFormValid() ? (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Reference details are complete and ready for resubmission</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Please fill in all required fields and upload a reference document</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={resubmitMutation.isPending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || resubmitMutation.isPending}
              className="flex-1 bg-[#920793] hover:bg-[#7a067b]"
            >
              {resubmitMutation.isPending ? 'Resubmitting...' : 'Confirm Resubmission'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
