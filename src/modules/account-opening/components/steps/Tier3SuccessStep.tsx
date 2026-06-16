'use client';
import { useEffect } from 'react';

import { TierResultStep } from './TierResultStep';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useAccountRequest } from '../../hooks/useAccountOpening';
import { Loader2 } from 'lucide-react';

type Props = {
  formState: IndividualSavingsFormState;
  onFinish: () => void;
  onFailure?: () => void;
};

export function Tier3SuccessStep({ formState, onFinish, onFailure }: Props) {
  const { data: request } = useAccountRequest(formState.accountRequestId || '', {
    enabled: !formState.accountNumber && !!formState.accountRequestId,
    refetchInterval: formState.accountNumber ? false : 3000,
  });

  useEffect(() => {
    if (request?.status === 'FAILED' && onFailure) {
      onFailure();
    }
  }, [request?.status, onFailure]);

  const resolvedAccountNumber = formState.accountNumber || request?.bankOneAccountNumber;
  const accountNumberDisplay = resolvedAccountNumber || (
    <span className="flex items-center justify-end gap-1.5 text-[#920793]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>Upgrading account...</span>
    </span>
  );

  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  return (
    <TierResultStep
      success
      tier={3}
      customerName={name}
      details={[
        ['Account Number', accountNumberDisplay],
        ['Account Type', 'Individual Savings'],
        ['Tier', 'Tier 3'],
        ['Status', 'Active'],
      ]}
      onFinish={onFinish}
    />
  );
}
