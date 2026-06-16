'use client';

import { useState } from 'react';
import { AppSidebar } from '@/src/components/layout/AppSidebar';
import { Header } from '@/src/components/layout/Header';
import { AuthGuard } from '@/src/components/layout/AuthGuard';
import { PinVerificationModal } from '@/src/modules/pin/components/PinVerificationModal';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { NetworkStatusBanner } from '@/src/components/layout/NetworkStatusBanner';
import { UnauthorizedHandler } from '@/src/components/layout/UnauthorizedHandler';
import { cn } from '@/src/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthGuard>
      <UnauthorizedHandler />
      <div className="min-h-screen bg-gray-50">
        <AppSidebar collapsed={collapsed} />

        <div
          className={cn(
            'flex flex-col min-h-screen transition-all duration-300',
            'md:ml-[260px]',
            collapsed && 'md:ml-[68px]'
          )}
        >
          <Header
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed((v) => !v)}
          />
          <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">{children}</main>
        </div>

        <PinVerificationModal />

        <BottomNav />

        <NetworkStatusBanner />
      </div>
    </AuthGuard>
  );
}
