import React from 'react';
import { StaffDetail } from '@src/modules/staff/components/StaffDetail';

export default function StaffDetailPage({ params }: { params: Promise<{ staffId: string }> }) {
  const { staffId } = React.use(params);
  return <StaffDetail staffId={staffId} />;
}
