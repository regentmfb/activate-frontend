import type { ReferenceFormData, ReferenceValidationErrors } from '../types/references.types';

// ── Validation rules ──────────────────────────────────────────────────────────

export function validateReference(reference: ReferenceFormData): ReferenceValidationErrors {
  const errors: ReferenceValidationErrors = {};

  // Full name validation
  if (!reference.fullName?.trim()) {
    errors.fullName = 'Full name is required';
  } else if (reference.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  } else if (reference.fullName.trim().length > 100) {
    errors.fullName = 'Full name cannot exceed 100 characters';
  }

  // Bank name validation
  if (!reference.bankName?.trim()) {
    errors.bankName = 'Bank name is required';
  } else if (reference.bankName.trim().length < 2) {
    errors.bankName = 'Bank name must be at least 2 characters';
  } else if (reference.bankName.trim().length > 100) {
    errors.bankName = 'Bank name cannot exceed 100 characters';
  }

  // Account number validation
  if (!reference.accountNumber?.trim()) {
    errors.accountNumber = 'Account number is required';
  } else if (!/^\d{10}$/.test(reference.accountNumber.trim())) {
    errors.accountNumber = 'Account number must be exactly 10 digits';
  }

  // Email validation (optional)
  if (reference.email?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reference.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
  }

  // Phone number validation (optional)
  if (reference.phoneNumber?.trim()) {
    if (!/^\d{10,11}$/.test(reference.phoneNumber.trim())) {
      errors.phoneNumber = 'Phone number must be 10 or 11 digits';
    }
  }

  // Document URL validation
  if (!reference.documentUrl?.trim()) {
    errors.documentUrl = 'Reference document is required';
  } else {
    try {
      new URL(reference.documentUrl);
    } catch {
      errors.documentUrl = 'Please provide a valid document URL';
    }
  }

  return errors;
}

export function validateReferences(references: ReferenceFormData[]): { [index: number]: ReferenceValidationErrors } {
  const errors: { [index: number]: ReferenceValidationErrors } = {};

  references.forEach((reference, index) => {
    const referenceErrors = validateReference(reference);
    if (Object.keys(referenceErrors).length > 0) {
      errors[index] = referenceErrors;
    }
  });

  return errors;
}

// ── Utility functions ─────────────────────────────────────────────────────────

export function hasValidationErrors(errors: { [index: number]: ReferenceValidationErrors }): boolean {
  return Object.keys(errors).length > 0;
}

export function getValidationErrorCount(errors: { [index: number]: ReferenceValidationErrors }): number {
  return Object.values(errors).reduce((count, referenceErrors) => {
    return count + Object.keys(referenceErrors).length;
  }, 0);
}

export function formatAccountNumber(accountNumber: string): string {
  // Remove any non-digit characters
  const digits = accountNumber.replace(/\D/g, '');
  
  // Format as XXXX-XXXX-XX for display
  if (digits.length === 10) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
  }
  
  return digits;
}

export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format as 0XXX-XXX-XXXX for display
  if (digits.length === 11 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  return digits;
}

export function createEmptyReference(): ReferenceFormData {
  return {
    fullName: '',
    bankName: '',
    accountNumber: '',
    email: '',
    phoneNumber: '',
    documentUrl: '',
  };
}

// ── Common bank names for autocomplete ────────────────────────────────────────

export const COMMON_BANKS = [
  'Access Bank',
  'Citibank Nigeria',
  'Ecobank Nigeria',
  'Fidelity Bank',
  'First Bank of Nigeria',
  'First City Monument Bank (FCMB)',
  'Guaranty Trust Bank (GTBank)',
  'Heritage Bank',
  'Keystone Bank',
  'Polaris Bank',
  'Providus Bank',
  'Stanbic IBTC Bank',
  'Standard Chartered Bank',
  'Sterling Bank',
  'SunTrust Bank',
  'Union Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'Unity Bank',
  'Wema Bank',
  'Zenith Bank',
];