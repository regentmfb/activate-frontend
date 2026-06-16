export type PinVerificationReason =
  | 'VIEW_PORTFOLIO_VALUE'
  | 'VIEW_CUSTOMER_BIODATA'
  | 'OPEN_ACCOUNT'
  | 'SUBMIT_ACCOUNT_OPENING'
  | 'UPGRADE_ACCOUNT'
  | 'VIEW_BALANCE'
  | 'SUBMIT_LOAN_APPLICATION'
  | 'APPROVE_WORKFLOW'
  | 'REJECT_WORKFLOW'
  | 'PLACE_LIEN'
  | 'REMOVE_LIEN'
  | 'RETRY_FAILED_ACTION';

export type PinVerificationState = {
  isOpen: boolean;
  reason: PinVerificationReason | null;
  onSuccess: (() => void) | null;
  onCancel: (() => void) | null;
};
