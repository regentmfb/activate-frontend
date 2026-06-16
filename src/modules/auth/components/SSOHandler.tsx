'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useValidateToken } from '../hooks/useAuth';

interface Props {
  children: ReactNode;
}

export function SSOHandler({ children }: Props) {
  const searchParams = useSearchParams();
  const ssoToken = searchParams.get('accessToken') ?? searchParams.get('token');

  const [redirecting, setRedirecting] = useState(false);
  const { mutate: validateToken, isError, error } = useValidateToken(() => setRedirecting(true));

  useEffect(() => {
    if (ssoToken) validateToken(ssoToken);
  }, [ssoToken]);

  if (ssoToken) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <Image
          src="/logo/regentnewlogo.png"
          alt="RegentMFB"
          width={160}
          height={48}
          className="h-12 w-auto mb-2"
        />

        {isError && !redirecting ? (
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <p className="text-sm font-semibold text-red-500">Sign-in failed</p>
            <p className="text-xs text-gray-400 max-w-xs">
              {error?.message ?? 'Your session token is invalid or has expired.'}
            </p>
            <a href="/login" className="mt-2 text-sm font-semibold text-[#920793] hover:underline">
              Back to login
            </a>
          </div>
        ) : (
          <>
            <svg
              className="animate-spin h-6 w-6 text-[#920793]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z" />
            </svg>
            <p className="text-sm text-gray-400 animate-pulse">
              {redirecting ? 'Redirecting...' : 'Signing you in...'}
            </p>
          </>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
