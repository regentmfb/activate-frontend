'use client';

import { TierResultStep } from './TierResultStep';
import { IndividualSavingsFormState } from '../../types/wizard.types';

type Props = {
  formState: IndividualSavingsFormState;
  failureReason?: string;
  onRetry: () => void;
  onCancel?: () => void;
};

export function Tier1FailedStep({ formState, failureReason, onRetry, onCancel }: Props) {
  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  return (
    <TierResultStep
      success={false}
      tier={1}
      customerName={name}
      details={[
        ['Account Type', 'Individual Savings'],
        ['Reference', formState.clientReference],
        ['Status', 'Failed'],
      ]}
      failureReason={failureReason ?? 'An error occurred while creating the account. Please try again.'}
      onRetry={onRetry}
      onFinish={onCancel}
    />
  );
}
