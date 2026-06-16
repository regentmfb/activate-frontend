// ── Document types ────────────────────────────────────────────────────────────

export type DocumentType =
  | 'CUSTOMER_PHOTO'
  | 'ID_CARD_PHOTO'
  | 'PROOF_OF_ADDRESS'
  | 'LOCATION_PHOTO'
  | 'REFERENCE_FORM'
  | 'SIGNATURE'
  | 'UTILITY_BILL'
  | 'BANK_STATEMENT'
  | 'EMPLOYMENT_LETTER'
  | 'OTHER';

export type DocumentSource = 'CAMERA' | 'GALLERY' | 'FILE_PICKER' | 'SCANNER';

// ── Upload payload ────────────────────────────────────────────────────────────

export type DocumentUploadPayload = {
  file: File;
  activateRequestId: string;
  customerId?: string;
  documentType: DocumentType;
  source?: DocumentSource;
};

// ── Upload response ───────────────────────────────────────────────────────────

export type DocumentUploadResponse = {
  success: boolean;
  documentId: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
};

// ── Document metadata ─────────────────────────────────────────────────────────

export type DocumentMetadata = {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  source?: DocumentSource;
  activateRequestId: string;
  customerId?: string;
  url: string;
  uploadedAt: string;
  uploadedBy: {
    staffId: string;
    staffName: string;
  };
};

// ── UI types ──────────────────────────────────────────────────────────────────

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export type FileUploadState = {
  file: File | null;
  preview?: string;
  status: UploadStatus;
  progress: number;
  error?: string;
  result?: DocumentUploadResponse;
};

export type AcceptedFileTypes = {
  [key: string]: string[];
};

// ── File validation ───────────────────────────────────────────────────────────

export type FileValidationOptions = {
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  maxFiles?: number;
};

export type FileValidationResult = {
  isValid: boolean;
  errors: string[];
};