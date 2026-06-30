'use client';
import { useEffect } from 'react';

import { TierResultStep } from './TierResultStep';
import { IndividualSavingsFormState } from '../../types/wizard.types';
import { useAccountRequest } from '../../hooks/useAccountOpening';
import { Loader2 } from 'lucide-react';

type Props = {
  formState: IndividualSavingsFormState;
  onUpgrade: () => void;
  onFinish: () => void;
  onFailure?: () => void;
};

export function Tier1SuccessStep({ formState, onUpgrade, onFinish, onFailure }: Props) {
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
  const isCurrentAccount = request?.accountType === 'CURRENT';
  
  const accountNumberDisplay = resolvedAccountNumber || (
    isCurrentAccount ? (
      <span className="text-amber-600 font-medium">Pending Regent Core Review</span>
    ) : (
      <span className="flex items-center justify-end gap-1.5 text-[#920793]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Creating account...</span>
      </span>
    )
  );

  const name = formState.biodata
    ? `${formState.biodata.firstName} ${formState.biodata.lastName}`
    : 'Customer';

  const accountTypeDisplay = request?.accountType === 'CURRENT' ? 'Individual Current' : 'Individual Savings';

  return (
    <TierResultStep
      success
      tier={1}
      customerName={name}
      title={isCurrentAccount ? 'Request Submitted!' : undefined}
      subtitle={isCurrentAccount ? `${name}'s current account request is pending Core Review.` : undefined}
      details={[
        ...(isCurrentAccount && !resolvedAccountNumber ? [] : [['Account Number', accountNumberDisplay]]),
        ['Account Type', accountTypeDisplay],
        ['Tier', 'Tier 1'],
        ['Status', isCurrentAccount && !resolvedAccountNumber ? 'Pending Regent Core' : 'Active'],
      ] as [string, React.ReactNode][]}
      onUpgrade={isCurrentAccount && !resolvedAccountNumber ? undefined : onUpgrade}
      upgradeLabel={isCurrentAccount && !resolvedAccountNumber ? undefined : "Upgrade to Tier 2"}
      onFinish={onFinish}
    />
  );
}
