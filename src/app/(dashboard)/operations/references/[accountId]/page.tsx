import React from 'react';
import { ReferenceAccountDetail } from '@/src/modules/references/components/ReferenceAccountDetail';

export default function ReferenceAccountDetailPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = React.use(params);
  return <ReferenceAccountDetail accountId={accountId} />;
}
