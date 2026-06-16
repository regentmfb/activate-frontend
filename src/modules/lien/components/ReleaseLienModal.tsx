'use client';

import { X, CheckCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useReleaseLien } from '../hooks/useLien';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  accountNumber: string;
};

export function ReleaseLienModal({ isOpen, onClose, accountNumber }: Props) {
  const releaseLienMutation = useReleaseLien();

  const handleRelease = async () => {
    try {
      await releaseLienMutation.mutateAsync({ accountNumber });
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Release Lien</h2>
              <p className="text-sm text-gray-500">Remove hold from customer account</p>
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
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              Are you sure you want to release the lien on this account?
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-mono font-medium text-gray-900">{accountNumber}</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Warning:</strong> This action will remove all holds/liens from the account and cannot be undone.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={releaseLienMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRelease}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={releaseLienMutation.isPending}
            >
              {releaseLienMutation.isPending ? 'Releasing...' : 'Release Lien'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}