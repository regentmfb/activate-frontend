'use client';

import { X, FileText } from 'lucide-react';
import { FileUploadDropzone } from './FileUploadDropzone';
import { useDocumentUpload } from '../hooks/useDocumentUpload';
import { ACCEPTED_FILE_TYPES } from '../utils/file-validation';
import type { DocumentType, DocumentSource, FileValidationOptions } from '../types/documents.types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  activateRequestId: string;
  customerId?: string;
  documentType: DocumentType;
  source?: DocumentSource;
  title?: string;
  description?: string;
  validationOptions?: FileValidationOptions;
  onSuccess?: (result: any) => void;
};

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CUSTOMER_PHOTO: 'Customer Photo',
  ID_CARD_PHOTO: 'ID Card Photo',
  PROOF_OF_ADDRESS: 'Proof of Address',
  LOCATION_PHOTO: 'Location Photo',
  REFERENCE_FORM: 'Reference Form',
  SIGNATURE: 'Signature',
  UTILITY_BILL: 'Utility Bill',
  BANK_STATEMENT: 'Bank Statement',
  EMPLOYMENT_LETTER: 'Employment Letter',
  OTHER: 'Document',
};

export function DocumentUploadModal({
  isOpen,
  onClose,
  activateRequestId,
  customerId,
  documentType,
  source,
  title,
  description,
  validationOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ACCEPTED_FILE_TYPES.all,
  },
  onSuccess,
}: Props) {
  const {
    uploadState,
    selectFile,
    uploadFile,
    clearFile,
    resetUpload,
  } = useDocumentUpload({
    activateRequestId,
    customerId,
    documentType,
    source,
    validationOptions,
    onSuccess: (result) => {
      onSuccess?.(result);
      // Auto-close modal after successful upload
      setTimeout(() => {
        onClose();
        clearFile();
      }, 1500);
    },
  });

  const handleClose = () => {
    if (uploadState.status !== 'uploading') {
      clearFile();
      onClose();
    }
  };

  if (!isOpen) return null;

  const modalTitle = title || `Upload ${DOCUMENT_TYPE_LABELS[documentType]}`;
  const modalDescription = description || `Select and upload your ${DOCUMENT_TYPE_LABELS[documentType].toLowerCase()}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-[#920793]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{modalTitle}</h2>
              <p className="text-sm text-gray-500">{modalDescription}</p>
            </div>
          </div>
          {uploadState.status !== 'uploading' && (
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Upload area */}
        <div className="p-6">
          <FileUploadDropzone
            uploadState={uploadState}
            onFileSelect={selectFile}
            onUpload={uploadFile}
            onClear={clearFile}
            onReset={resetUpload}
            validationOptions={validationOptions}
            disabled={uploadState.status === 'uploading'}
            label={`Select ${DOCUMENT_TYPE_LABELS[documentType]}`}
            description="Drag and drop a file here, or click to select"
          />
        </div>

        {/* Footer info */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              <strong>Accepted formats:</strong> JPG, PNG, PDF, DOC, DOCX
            </p>
            <p className="text-xs text-gray-600 mt-1">
              <strong>Maximum size:</strong> {Math.round((validationOptions.maxSize || 10485760) / (1024 * 1024))}MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}