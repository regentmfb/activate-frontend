'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth.store';
import { pinApi } from '@/src/modules/pin/api/pin.api';
import { PinSetupModal } from '@/src/modules/pin/components/PinSetupModal';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, hasPin, setHasPin } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [checkingPin, setCheckingPin] = useState(false);

  // Wait for Zustand persist to rehydrate from localStorage before checking auth
  useEffect(() => {
    console.log('[AuthGuard] mount — hasHydrated:', useAuthStore.persist.hasHydrated(), '| isAuthenticated:', useAuthStore.getState().isAuthenticated);

    const unsub = useAuthStore.persist.onFinishHydration(() => {
      console.log('[AuthGuard] onFinishHydration fired — isAuthenticated:', useAuthStore.getState().isAuthenticated);
      setHydrated(true);
    });

    // If already hydrated (e.g. store was reused), resolve immediately
    if (useAuthStore.persist.hasHydrated()) {
      console.log('[AuthGuard] already hydrated — isAuthenticated:', useAuthStore.getState().isAuthenticated);
      setHydrated(true);
    }

    return unsub;
  }, []);

  // Redirect to login if not authenticated after hydration
  useEffect(() => {
    console.log('[AuthGuard] auth check — hydrated:', hydrated, '| isAuthenticated:', isAuthenticated);
    if (!hydrated) return;
    if (!isAuthenticated) {
      console.log('[AuthGuard] not authenticated → redirecting to /login');
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  // Check PIN status once per session (only when authenticated and hasPin is unknown)
  useEffect(() => {
    if (!hydrated || !isAuthenticated || hasPin !== null) return;

    setCheckingPin(true);
    pinApi
      .getStatus()
      .then(({ hasPin: hp }) => {
        setHasPin(hp);
      })
      .catch(() => {
        // If the check fails (network error etc.), allow access — PIN verify will catch it
        setHasPin(true);
      })
      .finally(() => setCheckingPin(false));
  }, [hydrated, isAuthenticated, hasPin, setHasPin]);

  // Loading state — hydrating or checking PIN
  if (!hydrated || !isAuthenticated || checkingPin || hasPin === null) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <svg
          className="animate-spin h-6 w-6 text-[#920793]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
        </svg>
      </div>
    );
  }

  // PIN not yet set — block with mandatory setup modal (renders over a blank page, not over content)
  if (hasPin === false) {
    return (
      <div className="h-screen bg-gray-50">
        <PinSetupModal />
      </div>
    );
  }

  return <>{children}</>;
}
