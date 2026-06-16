'use client';

import { TierResultStep } from './TierResultStep';
import { IndividualSavingsFormState } from '../../types/wizard.types';

type Props = {
  formState: IndividualSavingsFormState;
  failureReason?: string;
  onRetry: () => void;
};

export function Tier3FailedStep({ formState, failureReason, onRetry }: Props) {
  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  return (
    <TierResultStep
      success={false}
      tier={3}
      customerName={name}
      details={[
        ['Account Number', formState.accountNumber ?? '—'],
        ['Account Type', 'Individual Savings'],
        ['Reference', formState.clientReference],
        ['Status', 'Upgrade Failed'],
      ]}
      failureReason={failureReason ?? 'Tier 3 upgrade could not be completed. Please verify the address and location details.'}
      onRetry={onRetry}
    />
  );
}
