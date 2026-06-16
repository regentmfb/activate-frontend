import { ComplianceAccountsList } from '@/src/modules/workflow/components/ComplianceAccountsList';

export default function ComplianceReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Reviews</h1>
        <p className="text-gray-600 mt-1">Review and approve account opening requests pending compliance verification</p>
      </div>
      
      <ComplianceAccountsList />
    </div>
  );
}