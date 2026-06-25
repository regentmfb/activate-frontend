'use client';

import { useState } from 'react';
import { Plus, Trash2, Upload, FileText } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { DocumentUploadModal } from '@/src/modules/documents/components/DocumentUploadModal';
import { 
  validateReferences, 
  hasValidationErrors, 
  createEmptyReference,
  formatAccountNumber,
  formatPhoneNumber,
  COMMON_BANKS 
} from '../utils/reference-validation';
import { cn } from '@/src/utils';
import type { ReferenceFormData, ReferenceValidationErrors } from '../types/references.types';

type Props = {
  references: ReferenceFormData[];
  onChange: (references: ReferenceFormData[]) => void;
  activateRequestId: string;
  disabled?: boolean;
  maxReferences?: number;
};

export function ReferenceForm({ 
  references, 
  onChange, 
  activateRequestId,
  disabled = false,
  maxReferences = 3 
}: Props) {
  const [errors, setErrors] = useState<{ [index: number]: ReferenceValidationErrors }>({});
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const validateForm = () => {
    const validationErrors = validateReferences(references);
    setErrors(validationErrors);
    return !hasValidationErrors(validationErrors);
  };

  const updateReference = (index: number, field: keyof ReferenceFormData, value: string) => {
    const updatedReferences = [...references];
    updatedReferences[index] = { ...updatedReferences[index], [field]: value };
    onChange(updatedReferences);
    
    // Clear field-specific error when user starts typing
    if (errors[index]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[index][field];
      if (Object.keys(updatedErrors[index] || {}).length === 0) {
        delete updatedErrors[index];
      }
      setErrors(updatedErrors);
    }
  };

  const addReference = () => {
    if (references.length < maxReferences) {
      onChange([...references, createEmptyReference()]);
    }
  };

  const removeReference = (index: number) => {
    const updatedReferences = references.filter((_, i) => i !== index);
    onChange(updatedReferences);
    
    // Remove errors for this index and adjust indices
    const updatedErrors = { ...errors };
    delete updatedErrors[index];
    
    // Shift error indices down
    const newErrors: { [index: number]: ReferenceValidationErrors } = {};
    Object.entries(updatedErrors).forEach(([key, value]) => {
      const errorIndex = parseInt(key);
      if (errorIndex > index) {
        newErrors[errorIndex - 1] = value;
      } else if (errorIndex < index) {
        newErrors[errorIndex] = value;
      }
    });
    
    setErrors(newErrors);
  };

  const handleDocumentUpload = (index: number, result: any) => {
    const url = result?.fileUrl ?? result?.url ?? result?.documentUrl ?? '';
    updateReference(index, 'documentUrl', url);
    setUploadingIndex(null);
  };

  return (
    <div className="space-y-6">
      {references.map((reference, index) => (
        <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Reference {index + 1}
            </h3>
            {references.length > 1 && (
              <button
                onClick={() => removeReference(index)}
                disabled={disabled}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor={`fullName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <Input
                id={`fullName-${index}`}
                value={reference.fullName}
                onChange={(e) => updateReference(index, 'fullName', e.target.value)}
                placeholder="Enter referee's full name"
                disabled={disabled}
                className={cn(errors[index]?.fullName && 'border-red-300')}
              />
              {errors[index]?.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors[index].fullName}</p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label htmlFor={`bankName-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
              <Input
                id={`bankName-${index}`}
                value={reference.bankName}
                onChange={(e) => updateReference(index, 'bankName', e.target.value)}
                placeholder="Enter bank name"
                disabled={disabled}
                list={`banks-${index}`}
                className={cn(errors[index]?.bankName && 'border-red-300')}
              />
              <datalist id={`banks-${index}`}>
                {COMMON_BANKS.map(bank => (
                  <option key={bank} value={bank} />
                ))}
              </datalist>
              {errors[index]?.bankName && (
                <p className="text-sm text-red-600 mt-1">{errors[index].bankName}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor={`accountNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Account Number <span className="text-red-500">*</span></label>
              <Input
                id={`accountNumber-${index}`}
                value={reference.accountNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  updateReference(index, 'accountNumber', value);
                }}
                placeholder="1234567890"
                disabled={disabled}
                className={cn(errors[index]?.accountNumber && 'border-red-300')}
              />
              {reference.accountNumber && reference.accountNumber.length === 10 && (
                <p className="text-xs text-gray-500 mt-1">
                  Formatted: {formatAccountNumber(reference.accountNumber)}
                </p>
              )}
              {errors[index]?.accountNumber && (
                <p className="text-sm text-red-600 mt-1">{errors[index].accountNumber}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor={`phoneNumber-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <Input
                id={`phoneNumber-${index}`}
                value={reference.phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                  updateReference(index, 'phoneNumber', value);
                }}
                placeholder="08012345678"
                disabled={disabled}
                className={cn(errors[index]?.phoneNumber && 'border-red-300')}
              />
              {reference.phoneNumber && reference.phoneNumber.length === 11 && (
                <p className="text-xs text-gray-500 mt-1">
                  Formatted: {formatPhoneNumber(reference.phoneNumber)}
                </p>
              )}
              {errors[index]?.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">{errors[index].phoneNumber}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor={`email-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <Input
                id={`email-${index}`}
                type="email"
                value={reference.email}
                onChange={(e) => updateReference(index, 'email', e.target.value)}
                placeholder="referee@example.com"
                disabled={disabled}
                className={cn(errors[index]?.email && 'border-red-300')}
              />
              {errors[index]?.email && (
                <p className="text-sm text-red-600 mt-1">{errors[index].email}</p>
              )}
            </div>

            {/* Document Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Document <span className="text-red-500">*</span></label>
              <div className="mt-1">
                {reference.documentUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <FileText className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Document uploaded</p>
                      <p className="text-xs text-green-700">Reference form ready for submission</p>
                    </div>
                    <Button
                      onClick={() => setUploadingIndex(index)}
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                    >
                      Replace
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setUploadingIndex(index)}
                    variant="outline"
                    disabled={disabled}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Reference Document
                  </Button>
                )}
              </div>
              {errors[index]?.documentUrl && (
                <p className="text-sm text-red-600 mt-1">{errors[index].documentUrl}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Add Reference Button */}
      {references.length < maxReferences && (
        <Button
          onClick={addReference}
          variant="outline"
          disabled={disabled}
          className="w-full border-dashed border-2 py-8"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Reference {references.length > 0 ? `(${references.length}/${maxReferences})` : ''}
        </Button>
      )}

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadingIndex !== null}
        onClose={() => setUploadingIndex(null)}
        activateRequestId={activateRequestId}
        documentType="REFERENCE_FORM"
        title="Upload Reference Document"
        description="Upload the signed reference form for this referee"
        onSuccess={(result) => {
          if (uploadingIndex !== null) {
            handleDocumentUpload(uploadingIndex, result);
          }
        }}
      />
    </div>
  );
}