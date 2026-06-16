'use client';

import { TierResultStep } from './TierResultStep';
import { IndividualSavingsFormState } from '../../types/wizard.types';

type Props = {
  formState: IndividualSavingsFormState;
  failureReason?: string;
  onRetry: () => void;
};

export function Tier2FailedStep({ formState, failureReason, onRetry }: Props) {
  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  return (
    <TierResultStep
      success={false}
      tier={2}
      customerName={name}
      details={[
        ['Account Number', formState.accountNumber ?? '—'],
        ['Account Type', 'Individual Savings'],
        ['Reference', formState.clientReference],
        ['Status', 'Upgrade Failed'],
      ]}
      failureReason={failureReason ?? 'Tier 2 upgrade could not be completed. Please verify the ID details and try again.'}
      onRetry={onRetry}
    />
  );
}
