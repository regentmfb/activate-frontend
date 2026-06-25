'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@src/lib/query-client';
import { IdentroProvider } from './IdentroProvider';
import PwaInstallBanner from '@src/components/pwa/PwaInstallBanner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <IdentroProvider>
        <PwaInstallBanner />
        {children}
        <Toaster position="top-center" richColors theme="dark" />
      </IdentroProvider>
    </QueryClientProvider>
  );
}
