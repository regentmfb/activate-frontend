import { ManualVerificationsView } from '@src/modules/identity/components/ManualVerificationsView';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manual Identity Overrides | Regent MFB Activate',
  description: 'Approve or reject manual KYC identity verification requests.',
};

export default function ManualVerificationsPage() {
  return <ManualVerificationsView />;
}
