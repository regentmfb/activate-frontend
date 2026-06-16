'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { appToast } from '@/src/lib/toast';

export function ToastHandler() {
  const params = useSearchParams();

  useEffect(() => {
    const toast = params.get('toast');
    if (!toast) return;

    if (toast === 'signed-in') {
      appToast.loginSuccess(params.get('name') ?? '');
    } else if (toast === 'sso-signin') {
      appToast.ssoSuccess();
    } else if (toast === 'logged-out') {
      appToast.logoutSuccess();
    } else if (toast === 'session-expired') {
      appToast.sessionExpired();
    }

    const url = new URL(window.location.href);
    url.searchParams.delete('toast');
    url.searchParams.delete('name');
    window.history.replaceState({}, '', url.toString());
  }, [params]);

  return null;
}
