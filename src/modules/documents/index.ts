// API
export { documentsApi } from './api/documents.api';

// Hooks
export { useDocumentUpload, DOCUMENTS_QUERY_KEYS } from './hooks/useDocumentUpload';

// Components
export { FileUploadDropzone } from './components/FileUploadDropzone';
export { DocumentUploadModal } from './components/DocumentUploadModal';

// Utils
export {
  validateFile,
  validateFiles,
  formatFileSize,
  getFileExtension,
  createFilePreview,
  isImageFile,
  isPDFFile,
  isDocumentFile,
  ACCEPTED_FILE_TYPES,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILES,
} from './utils/file-validation';

// Types
export type {
  DocumentType,
  DocumentSource,
  DocumentUploadPayload,
  DocumentUploadResponse,
  DocumentMetadata,
  UploadStatus,
  FileUploadState,
  AcceptedFileTypes,
  FileValidationOptions,
  FileValidationResult,
} from './types/documents.types';