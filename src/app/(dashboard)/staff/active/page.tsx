'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@src/hooks/usePermissions';
import { ActivateStaffView } from '@src/modules/staff/components/ActivateStaffView';

export default function ActiveStaffPage() {
  const { role } = usePermissions();
  const router = useRouter();

  useEffect(() => {
    if (role !== null && role !== 'SUPER_ADMIN') {
      router.replace('/dashboard');
    }
  }, [role, router]);

  // Don't render while role is still being resolved, or if not super admin
  if (role !== 'SUPER_ADMIN') return null;

  return <ActivateStaffView />;
}
