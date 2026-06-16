import { toast } from 'sonner';

function formatBackendMessage(message: string): { title: string; description: string | undefined } {
  if (!message) {
    return { title: 'Operation Failed', description: undefined };
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
    };
  }

  // 3. Account type not available for onboarding
  if (message.toLowerCase().includes('not available for onboarding')) {
    return {
      title: 'Account Type Unavailable',
      description: 'The selected account type is currently not available for onboarding.',
    };
  }

  return { title: 'Operation Failed', description: message };
}

export const appToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => {
    const { title, description } = formatBackendMessage(message);
    if (description && description !== message) {
      return toast.error(title, {
        // description,
        duration: 8000,
      });
    }
    return toast.error(message);
  },
  info:    (message: string) => toast.info(message),
  warning: (message: string) => toast.warning(message),
  loading: (message: string) => toast.loading(message),

  // Auth
  loginSuccess:   (name: string) => appToast.success(`Welcome back, ${name}`),
  loginError:     (message?: string) => {
    const msg = message === 'Authentication failed' 
      ? 'Access denied. Insufficient permissions.' 
      : (message ?? 'Invalid email or password.');
    return appToast.error(msg);
  },
  logoutSuccess:  () => appToast.success('Logged out successfully'),
  ssoSuccess:     () => appToast.success('Authenticated via Orchestro'),
  ssoError:       (message?: string) => {
    const msg = message === 'Authentication failed' 
      ? 'Access denied. Insufficient permissions.' 
      : (message ?? 'Your session token is invalid or has expired.');
    return appToast.error(msg);
  },
  sessionExpired: () => appToast.error('Session expired. Please sign in again.'),

  // Account opening
  accountSubmitted: () => appToast.success('Account opening request submitted successfully'),
  accountDrafted:   () => appToast.info('Draft saved'),

  // Lien operations
  lienPlaced:   (reference: string) => appToast.success(`Lien placed successfully. Reference: ${reference}`),
  lienReleased: () => appToast.success('Lien released successfully'),
  lienError:    (message?: string) => appToast.error(message ?? 'Lien operation failed'),

  // Compliance workflow
  complianceApproved: () => appToast.success('Compliance review approved successfully'),
  complianceRejected: () => appToast.success('Account marked as non-compliant'),
  complianceError:    (message?: string) => appToast.error(message ?? 'Compliance operation failed'),

  // Document upload
  documentUploaded: () => appToast.success('Document uploaded successfully'),
  documentDeleted:  () => appToast.success('Document deleted successfully'),
  documentError:    (message?: string) => appToast.error(message ?? 'Document operation failed'),
  uploadProgress:   (progress: number) => appToast.loading(`Uploading... ${progress}%`),

  // References
  referencesSubmitted: (count: number) => appToast.success(`${count} reference${count > 1 ? 's' : ''} submitted successfully`),
  referenceApproved:   () => appToast.success('Reference approved successfully'),
  referenceRejected:   () => appToast.success('Reference rejected and corrective task created'),
  referenceError:      (message?: string) => appToast.error(message ?? 'Reference operation failed'),

  // General
  saved:     () => appToast.success('Changes saved successfully'),
  deleted:   () => appToast.success('Deleted successfully'),
  copied:    () => appToast.success('Copied to clipboard'),
  forbidden: () => appToast.error('You do not have permission to perform this action.'),
};
