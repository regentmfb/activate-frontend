'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/auth.store';
import { clearToken } from '@/src/lib/orchestro-client';

/**
 * Listens for the 'auth:unauthorized' custom event dispatched by the API
 * interceptors when a 401 is received. Handles logout and redirect without
 * a full page reload, so console logs are preserved for debugging.
 */
export function UnauthorizedHandler() {
  const router = useRouter();
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    function handleUnauthorized() {
      console.log('[UnauthorizedHandler] auth:unauthorized event received — clearing user and redirecting');
      clearUser();
      clearToken();
      router.replace('/login');
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [router, clearUser]);

  return null;
}
