import { ActivityLogsView } from '@src/modules/staff/components/ActivityLogsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activity Logs | Regent MFB Activate',
  description: 'View and filter staff audit trails and activity logs.',
};

export default function ActivityLogsPage() {
  return <ActivityLogsView />;
}
