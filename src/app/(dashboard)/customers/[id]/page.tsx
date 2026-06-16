import React from 'react';
import { CustomerDetail } from '@src/modules/customers/components/CustomerDetail';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <CustomerDetail id={id} />;
}
