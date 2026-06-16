'use client';

import { LienRequestsView } from '@src/modules/lien/components/LienRequestsView';
import { PermissionGate } from '@src/components/ui/PermissionGate';

export default function LienRequestsPage() {
  console.log('[LienRequestsPage] rendered');
  return (
    <PermissionGate
      anyOf={['CAN_REVIEW_WORKFLOW', 'CAN_PLACE_LIEN', 'CAN_OPEN_ACCOUNT']}
      fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-[14px] text-gray-400">You don&apos;t have access to this page.</p>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-[20px] font-black text-gray-900">Lien Requests</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">
            Review and action lien placement requests across the approval chain.
          </p>
        </div>
        <LienRequestsView />
      </div>
    </PermissionGate>
  );
}
