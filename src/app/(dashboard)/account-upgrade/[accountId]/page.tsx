import React from 'react';
import { AccountUpgradeView } from '@src/modules/account-upgrade/components/AccountUpgradeView';

export default function AccountUpgradePage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ from?: string; currentTier?: string }>;
}) {
  const { accountId } = React.use(params);
  const { from, currentTier } = React.use(searchParams);

  return (
    <AccountUpgradeView
      accountNumber={accountId}
      fromCustomer={from === 'customer'}
      currentTier={currentTier ? parseInt(currentTier, 10) : undefined}
    />
  );
}
