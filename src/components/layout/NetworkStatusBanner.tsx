'use client';

import { WifiOff, Wifi } from 'lucide-react';
import { useNetworkStatus } from '@src/hooks/useNetworkStatus';
import { useEffect, useState } from 'react';
import { cn } from '@src/utils';

export function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const t = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  return (
    <div
      className={cn(
        'fixed top-14 left-0 right-0 z-30 flex items-center justify-center gap-2 py-2 px-4 text-[13px] font-medium transition-all',
        showReconnected
          ? 'bg-green-500 text-white'
          : 'bg-gray-900 text-white'
      )}
    >
      {showReconnected ? (
        <>
          <Wifi className="h-4 w-4 shrink-0" />
          Back online — your data will sync automatically.
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 shrink-0" />
          You&apos;re offline — changes will be saved and synced when reconnected.
        </>
      )}
    </div>
  );
}
