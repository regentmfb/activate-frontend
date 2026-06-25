'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
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
  { label: 'Create Account', href: '/account-opening/select-type', icon: Plus,            permission: 'CAN_OPEN_ACCOUNT'   as const, center: true },
  { label: 'Drafts',       href: '/drafts',                      icon: FileText,        permission: 'CAN_OPEN_ACCOUNT' as const },
  { label: 'Compliance',   href: '/workflow/compliance',         icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'Manual Verif', href: '/workflow/manual-verifications',icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'Lien Reqs',    href: '/workflow/lien-requests',      icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'References',   href: '/operations/references',       icon: GitPullRequest,  permission: 'CAN_REVIEW_WORKFLOW' as const },
  { label: 'Tasks',        href: '/tasks',                       icon: ClipboardList,   permission: null },
  { label: 'Targets',      href: '/targets',                     icon: Target,          targetsSetterOnly: true },
  { label: 'Active Staff', href: '/staff/active',                icon: UserCog,         superAdminOnly: true },
];

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@src/components/ui/drawer';
import { MoreHorizontal } from 'lucide-react';

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

  const allowed = ALL_NAV.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin) return false;
    if (item.targetsSetterOnly && !isTargetSetter) return false;
    if (item.permission && !can(item.permission as any)) return false;
    return true;
  });

  const centerItem = allowed.find((item) => item.center) ?? null;
  const sideItems = allowed.filter((item) => !item.center);

  let displayItems: any[] = [];
  let overflowItems: any[] = [];

  if (allowed.length > 5) {
    const visibleSideItems = sideItems.slice(0, centerItem ? 3 : 4);
    overflowItems = sideItems.slice(centerItem ? 3 : 4);

    const left = visibleSideItems.slice(0, 2);
    const right = visibleSideItems.slice(2);

    displayItems = centerItem ? [...left, centerItem, ...right] : visibleSideItems;
    
    displayItems.push({
      label: 'More',
      href: '#more',
      icon: MoreHorizontal,
    });
  } else {
    const left = sideItems.slice(0, Math.ceil(sideItems.length / 2));
    const right = sideItems.slice(Math.ceil(sideItems.length / 2));
    displayItems = centerItem ? [...left, centerItem, ...right] : sideItems;
  }

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  const renderItem = (item: any, isOverflow = false) => {
    const active = isActive(item.href);
    const linkEl = (
      <Link
        key={item.label}
        href={item.href !== '#more' ? item.href : '#'}
        onClick={() => {
          // Provide some immediate feedback if desired, or let Next.js handle it
        }}
        className={cn(
          "relative flex flex-col items-center justify-center transition-all duration-300 group",
          isOverflow ? "p-4 bg-gray-50 rounded-2xl border border-gray-100" : "flex-1 h-full"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            "relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
            active ? "bg-[#920793]/15 text-[#920793] scale-100" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 dark:text-gray-400 scale-95 hover:scale-100 hover:text-gray-800 dark:hover:text-gray-200",
            isOverflow && !active && "bg-white shadow-sm"
          )}>
            <item.icon className="h-[22px] w-[22px] shrink-0" strokeWidth={active ? 2.5 : 2} />
            {active && !isOverflow && (
              <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-[#920793] transition-all" />
            )}
          </div>
          <span className={cn(
            'text-[9px] font-semibold transition-colors duration-300 line-clamp-1 text-center max-w-[4rem]',
            active ? 'text-[#920793]' : 'text-gray-400 dark:text-gray-500',
            isOverflow && "text-[11px] mt-1 text-gray-700"
          )}>
            {item.label}
          </span>
        </div>
      </Link>
    );

    return linkEl;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pointer-events-none safe-area-pb">
      <div className="flex items-center justify-around h-[72px] pointer-events-auto backdrop-blur-2xl bg-white/70 dark:bg-zinc-900/70 border-t border-white/40 dark:border-zinc-800/60 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.2)] px-2 pb-safe">
        {displayItems.map((item) => {
          if (item.label === 'More') {
            return (
              <Drawer key="more" open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <button className="relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 group outline-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300 text-gray-500 hover:bg-gray-100 scale-95 hover:scale-100 hover:text-gray-800">
                        <item.icon className="h-[22px] w-[22px] shrink-0" strokeWidth={2} />
                      </div>
                      <span className="text-[9px] font-semibold transition-colors duration-300 line-clamp-1 text-center max-w-[4rem] text-gray-400">
                        {item.label}
                      </span>
                    </div>
                  </button>
                </DrawerTrigger>
                <DrawerContent className="bg-white px-4 pb-8">
                  <DrawerHeader className="text-left px-0 pt-4 pb-2">
                    <DrawerTitle className="text-lg font-black text-gray-900">More Options</DrawerTitle>
                  </DrawerHeader>
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    {overflowItems.map((overItem) => renderItem(overItem, true))}
                  </div>
                </DrawerContent>
              </Drawer>
            );
          }
          return renderItem(item);
        })}
      </div>
    </nav>
  );
}
