import React from 'react';
import { WorkflowDetail } from '@src/modules/workflow/components/WorkflowDetail';

export default function WorkflowReviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <WorkflowDetail id={id} />;
}
