'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Users,
  UserCog,
  GitPullRequest,
  Banknote,
  Target,
} from 'lucide-react';
import { cn } from '@src/utils';
import { useAuthStore } from '@src/store/auth.store';
import { usePermissions } from '@src/hooks/usePermissions';

// All possible nav items — filtered per role at runtime
const ALL_NAV = [
  { label: 'Dashboard',    href: '/dashboard',                   icon: LayoutDashboard, permission: null },
  { label: 'Customers',    href: '/customers',                   icon: Users,           permission: null },
  { label: 'Open Account', href: '/account-opening/select-type', icon: Plus,            permission: 'CAN_OPEN_ACCOUNT'   as const, center: true },
  { label: 'Compliance',   href: '/workflow/compliance',         icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'Manual Verif', href: '/workflow/manual-verifications',icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'Lien Reqs',    href: '/workflow/lien-requests',      icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'References',   href: '/operations/references',       icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'Tasks',        href: '/tasks',                       icon: ClipboardList,   permission: null },
  { label: 'Targets',      href: '/targets',                     icon: Target,          targetsSetterOnly: true },
  { label: 'Active Staff', href: '/staff/active',                icon: UserCog,         superAdminOnly: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const { can } = usePermissions();

  const user = useAuthStore((s) => s.user);

  const hrmsRoleStrings = user?.hrmsRoles || [];
  const fullRoleStrings = user?.roles?.map((r: any) => r.name || r) || [];
  const allRoleStrings = [...hrmsRoleStrings, ...fullRoleStrings].map((r) => r.toUpperCase().replace(/[\s\._-]/g, ''));
  
  const isSuperAdmin = allRoleStrings.includes('COMPANY') || allRoleStrings.includes('SUPERADMIN');
  const isCmo = allRoleStrings.includes('CMO') || allRoleStrings.includes('ACTIVATECMO') || allRoleStrings.includes('CHIEFMARKETINGOFFICER');
  const isTargetSetter = isSuperAdmin || isCmo;

  // Filter to what this role can see
  const allowed = ALL_NAV.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.targetsSetterOnly && !isTargetSetter) return false;
    if (item.permission && !can(item.permission as any)) return false;
    return true;
  });

  // Pick the first available center item (Open Account > Workflow)
  const centerItem = allowed.find((item) => item.center) ?? null;

  // Non-center items — exclude center candidates so they don't appear twice
  const sideItems = allowed.filter((item) => !item.center);

  // Build final nav: split side items around the center slot
  const left  = sideItems.slice(0, Math.ceil(sideItems.length / 2));
  const right = sideItems.slice(Math.ceil(sideItems.length / 2));

  const navItems = centerItem
    ? [...left, centerItem, ...right]
    : sideItems;

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none safe-area-pb">
      <div className="flex items-end h-[84px] overflow-x-auto no-scrollbar pointer-events-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const isCenter = item.center === true;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 min-w-[4.5rem] flex flex-col items-center justify-end pb-2 gap-0.5 transition-colors relative',
                isCenter 
                  ? 'h-[84px] text-white' 
                  : cn('h-16 bg-white border-t border-gray-100', active ? 'text-[#920793]' : 'text-gray-400')
              )}
            >
              {isCenter ? (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 -z-10" />
                  <div
                    className="mb-4 h-14 w-14 rounded-full flex items-center justify-center shadow-lg shrink-0"
                    style={{ backgroundColor: '#920793' }}
                  >
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span className={cn('text-[10px] font-medium', active ? 'text-[#920793]' : 'text-gray-400')}>
                    {item.label}
                  </span>
                  {active && (
                    <span className="absolute top-1 h-1 w-1 rounded-full bg-[#920793]" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
