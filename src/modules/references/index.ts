// API
export { referencesApi } from './api/references.api';

// Hooks
export {
  useSubmitReferences,
  usePendingReferences,
  usePassReference,
  useFailReference,
  useReferencesByAccountId,
  useResubmitReference,
  REFERENCES_QUERY_KEYS,
} from './hooks/useReferences';

// Components
export { ReferenceForm } from './components/ReferenceForm';
export { PendingReferencesList } from './components/PendingReferencesList';
export { ReferenceSubmissionModal } from './components/ReferenceSubmissionModal';
export { ReferenceResubmissionModal } from './components/ReferenceResubmissionModal';

// Utils
export {
  validateReference,
  validateReferences,
  hasValidationErrors,
  getValidationErrorCount,
  formatAccountNumber,
  formatPhoneNumber,
  createEmptyReference,
  COMMON_BANKS,
} from './utils/reference-validation';

// Types
export type {
  Reference,
  ReferenceRecord,
  ReferenceStatus,
  SubmitReferencesPayload,
  FailReferencePayload,
  SubmitReferencesResponse,
  PassReferenceResponse,
  FailReferenceResponse,
  ReferenceFormData,
  ReferenceAction,
  ReferenceValidationErrors,
} from './types/references.types';