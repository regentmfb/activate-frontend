'use client';

import { useState } from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { PermissionGate } from '@/src/components/ui/PermissionGate';
import { PlaceLienModal } from './PlaceLienModal';
import { ReleaseLienModal } from './ReleaseLienModal';

type Props = {
  accountNumber: string;
  hasLien?: boolean;
  className?: string;
};

export function LienActions({ accountNumber, hasLien = false, className }: Props) {
  const [showPlaceModal, setShowPlaceModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  return (
    <PermissionGate permission="CAN_PLACE_LIEN">
      <div className={className}>
        {hasLien ? (
          <Button
            onClick={() => setShowReleaseModal(true)}
            variant="outline"
            size="sm"
            className="text-green-600 border-green-200 hover:bg-green-50"
          >
            <ShieldOff className="w-4 h-4 mr-2" />
            Release Lien
          </Button>
        ) : (
          <Button
            onClick={() => setShowPlaceModal(true)}
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <Shield className="w-4 h-4 mr-2" />
            Place Lien
          </Button>
        )}

        <PlaceLienModal
          isOpen={showPlaceModal}
          onClose={() => setShowPlaceModal(false)}
          accountNumber={accountNumber}
        />

        <ReleaseLienModal
          isOpen={showReleaseModal}
          onClose={() => setShowReleaseModal(false)}
          accountNumber={accountNumber}
        />
      </div>
    </PermissionGate>
  );
}