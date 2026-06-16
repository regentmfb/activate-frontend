import React from 'react';
import { TaskDetail } from '@/src/modules/tasks/components/TaskDetail';

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <TaskDetail id={id} />;
}
