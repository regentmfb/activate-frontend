import { Suspense } from 'react';
import { SSOHandler } from '@/src/modules/auth/components/SSOHandler';
import { SignInLayout } from '@/src/modules/auth/components/SignInLayout';

export default function LoginPage() {
  return (
    <Suspense>
      <SSOHandler>
        <SignInLayout />
      </SSOHandler>
    </Suspense>
  );
}
