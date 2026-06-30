import { toast } from 'sonner';
import { useMessageStore } from '@src/store/message.store';

function formatBackendMessage(message: string): { title: string; description: string; actionText?: string } {
  if (!message) {
    return { 
      title: 'Operation Failed', 
      description: 'An unexpected error occurred.', 
      actionText: 'Please try again or contact support.' 
    };
  }

  // 1. Duplicate account opening request (e.g., active or completed)
  const duplicateMatch = message.match(
    /(?:customer\s+)?already\s+has\s+an\s+active\s+or\s+completed\s+(\w+)\s+account\s+request\s+\(Request\s+Number:\s*([^)]+)\)/i
  );
  if (duplicateMatch) {
    const [, type, reqNum] = duplicateMatch;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return {
      title: `${formattedType} Account Already Exists`,
      description: `This customer already has an active or completed ${formattedType.toLowerCase()} account request (${reqNum}).`,
      actionText: 'Please review the existing request in the dashboard.',
    };
  }

  // 2. Already has an active or in-progress account check
  const existMatch = message.match(
    /customer\s+already\s+has\s+an\s+active\s+or\s+in\s+progress\s+(\w+)\s+account/i
  );
  if (existMatch) {
    const [, type] = existMatch;
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    return {
      title: `${formattedType} Account Already Exists`,
      description: `An active or in-progress ${formattedType.toLowerCase()} account already exists for this customer.`,
      actionText: 'You cannot open multiple accounts of the same type.',
    };
  }

  // 3. Account type not available for onboarding
  if (message.toLowerCase().includes('not available for onboarding')) {
    return {
      title: 'Account Type Unavailable',
      description: 'The selected account type is currently not available for onboarding.',
      actionText: 'Please select a different account type.',
    };
  }

  return { 
    title: 'Operation Failed', 
    description: message,
    actionText: 'Please check the details and try again.'
  };
}

export const appToast = {
  // Generic business messages
  success: (message: string) => {
    useMessageStore.getState().showMessage({
      type: 'success',
      title: 'Success',
      description: message,
    });
  },
  error: (message: string) => {
    const { title, description, actionText } = formatBackendMessage(message);
    useMessageStore.getState().showMessage({
      type: 'error',
      title: title,
      description: `${description} ${actionText}`,
      actionLabel: 'Close',
    });
  },
  
  // Standard informational messages (now using modals as requested)
  info: (message: string) => useMessageStore.getState().showMessage({
    type: 'info',
    title: 'Information',
    description: message,
    actionLabel: 'OK'
  }),
  warning: (message: string) => useMessageStore.getState().showMessage({
    type: 'info', // Using info style for warnings in the modal
    title: 'Warning',
    description: message,
    actionLabel: 'Acknowledge'
  }),
  // Loading cannot easily be a blocking modal without disrupting flow, but if required, we map to info.
  loading: (message: string) => useMessageStore.getState().showMessage({
    type: 'info',
    title: 'Processing',
    description: message,
  }),

  // Auth (always use standard toasts to avoid overlaying on login screens)
  loginSuccess:   (name: string) => toast.success(`Welcome back, ${name}`),
  loginError:     (message?: string) => {
    const msg = message === 'Authentication failed' 
      ? 'Access denied. Insufficient permissions.' 
      : (message ?? 'Invalid email or password.');
    return toast.error(msg);
  },
  logoutSuccess:  () => toast.success('Logged out successfully'),
  ssoSuccess:     () => toast.success('Authenticated via Orchestro'),
  ssoError:       (message?: string) => {
    const msg = message === 'Authentication failed' 
      ? 'Access denied. Insufficient permissions.' 
      : (message ?? 'Your session token is invalid or has expired.');
    return toast.error(msg);
  },
  sessionExpired: () => toast.error('Session expired. Please sign in again.'),

  // Minor ephemeral actions — small auto-dismissing toasts (non-blocking)
  saved:            () => toast.success('Changes saved successfully'),
  deleted:          () => toast.success('Deleted successfully'),
  copied:           () => toast.success('Copied to clipboard'),
  accountDrafted:   () => toast.info('Draft saved'),
  documentUploaded: () => toast.success('Document uploaded successfully'),
  documentDeleted:  () => toast.success('Document deleted successfully'),
  uploadProgress:   (progress: number) => toast.loading(`Uploading... ${progress}%`),

  // Business Workflow Actions
  accountSubmitted: () => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'Request Submitted',
    description: 'Account opening request has been submitted successfully.',
    actionLabel: 'Acknowledge',
  }),

  lienPlaced: (reference: string) => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'Lien Placed',
    description: `Lien has been placed successfully. Reference Number: ${reference}`,
    actionLabel: 'Done',
  }),
  lienReleased: () => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'Lien Released',
    description: 'The lien has been successfully released from the account.',
    actionLabel: 'Done',
  }),
  lienError: (message?: string) => useMessageStore.getState().showMessage({
    type: 'error',
    title: 'Lien Operation Failed',
    description: message ?? 'Failed to process lien operation. Please try again.',
    actionLabel: 'Close',
  }),

  complianceApproved: () => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'Review Approved',
    description: 'Compliance review was approved successfully.',
    actionLabel: 'Continue',
  }),
  complianceRejected: () => useMessageStore.getState().showMessage({
    type: 'success', // Kept as success to match previous implementation
    title: 'Account Rejected',
    description: 'Account has been marked as non-compliant.',
    actionLabel: 'Acknowledge',
  }),
  complianceError: (message?: string) => useMessageStore.getState().showMessage({
    type: 'error',
    title: 'Compliance Operation Failed',
    description: message ?? 'An error occurred during the compliance review.',
    actionLabel: 'Close',
  }),

  documentError: (message?: string) => useMessageStore.getState().showMessage({
    type: 'error',
    title: 'Document Upload Failed',
    description: message ?? 'Failed to upload document. Please check the file format and try again.',
    actionLabel: 'Close',
  }),

  referencesSubmitted: (count: number) => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'References Submitted',
    description: `${count} reference${count > 1 ? 's have' : ' has'} been submitted successfully and ${count > 1 ? 'are' : 'is'} pending review.`,
    actionLabel: 'Continue',
  }),
  referenceApproved: () => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'Reference Approved',
    description: 'The reference has been approved successfully.',
    actionLabel: 'Continue',
  }),
  referenceRejected: () => useMessageStore.getState().showMessage({
    type: 'success',
    title: 'Reference Rejected',
    description: 'The reference was rejected and a corrective task has been created.',
    actionLabel: 'Acknowledge',
  }),
  referenceError: (message?: string) => useMessageStore.getState().showMessage({
    type: 'error',
    title: 'Reference Operation Failed',
    description: message ?? 'Failed to process reference. Please verify the details.',
    actionLabel: 'Close',
  }),

  forbidden: () => useMessageStore.getState().showMessage({
    type: 'error',
    title: 'Access Denied',
    description: 'You do not have permission to perform this action.',
    actionLabel: 'Return to Dashboard',
  }),
};
