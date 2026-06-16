import { PendingReferencesList } from '@/src/modules/references/components/PendingReferencesList';

export default function OperationsReferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reference Reviews</h1>
        <p className="text-gray-600 mt-1">Review and validate referee forms for current account opening requests</p>
      </div>
      
      <PendingReferencesList />
    </div>
  );
}