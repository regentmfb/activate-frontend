import React from 'react';
import { ComplianceAccountDetail } from '@/src/modules/workflow/components/ComplianceAccountDetail';

export default function ComplianceAccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <ComplianceAccountDetail id={id} />;
}
