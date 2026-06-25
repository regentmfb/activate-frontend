'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCog,
  FolderOpen,
  FileText,
  GitPullRequest,
  Banknote,
  Settings,
  Award,
  Building2,
  ChevronDown,
  ChevronRight,
  Target,
} from 'lucide-react';
import { cn } from '@/src/utils';
import { type Permission } from '@/src/constants/permissions';
import { usePermissions } from '@/src/hooks/usePermissions';
import { useAuthStore } from '@/src/store/auth.store';
import { usePendingTasksCount } from '@/src/modules/tasks/hooks/useTaskBank';

type NavChild = {
  name: string;
  description?: string;
  href: string;
  permission?: Permission;
};

type NavItem = {
  name: string;
  href?: string;
  icon: React.ElementType;
  permission?: Permission;
  children?: NavChild[];
  dividerBefore?: boolean;
  superAdminOnly?: boolean;
  targetsSetterOnly?: boolean;
};

const NAV: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    superAdminOnly: true,
    children: [
      // { name: 'Executive', description: 'Bank-wide overview', href: '/dashboard?view=md' },
      { name: 'CMO', description: 'Directorate view', href: '/dashboard?view=cmo' },
      { name: 'Team Lead', description: 'Team performance', href: '/dashboard?view=teamLead' },
      { name: 'RM', description: 'Individual metrics', href: '/dashboard?view=rm' },
    ],
  },

  {
    name: 'Create Account',
    href: '/account-opening/select-type',
    icon: FolderOpen,
    permission: 'CAN_OPEN_ACCOUNT',
    dividerBefore: true,
  },
  {
    name: 'Drafts',
    href: '/drafts',
    icon: FileText,
    permission: 'CAN_OPEN_ACCOUNT',
  },
  // {
  //   name: 'Loans',
  //   href: '/loans',
  //   icon: Banknote,
  //   permission: 'CAN_SUBMIT_LOAN',
  // },
  {
    name: 'Workflow',
    icon: GitPullRequest,
    permission: 'CAN_REVIEW_WORKFLOW',
    children: [
      // { name: 'Reviews', href: '/workflow/reviews', permission: 'CAN_REVIEW_WORKFLOW' },
      { name: 'Compliance', href: '/workflow/compliance', permission: 'CAN_REVIEW_WORKFLOW' },
      { name: 'Manual Verifications', href: '/workflow/manual-verifications', permission: 'CAN_REVIEW_WORKFLOW' },
      { name: 'Lien Requests', href: '/workflow/lien-requests' },
      { name: 'References', href: '/operations/references', permission: 'CAN_REVIEW_WORKFLOW' },
    ],
  },

  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
    dividerBefore: true,
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: ClipboardList,
  },
  {
    name: 'Targets',
    href: '/targets',
    icon: Target,
    targetsSetterOnly: true,
  },
  {
    name: 'Active Staff',
    href: '/staff/active',
    icon: UserCog,
    superAdminOnly: true,
  },

  // {
  //   name: 'Settings',
  //   href: '/settings',
  //   icon: Settings,
  //   dividerBefore: true,
  // },
];

function NavLinks({ onClose, collapsed = false }: { onClose: () => void; collapsed?: boolean }) {
  const pathname = usePathname();
  const { can } = usePermissions();
  const user = useAuthStore((s) => s.user);
  const { data: pendingCount } = usePendingTasksCount();

  const hrmsRoleStrings = user?.hrmsRoles || [];
  const fullRoleStrings = user?.roles?.map((r: any) => r.name || r) || [];
  const allRoleStrings = [...hrmsRoleStrings, ...fullRoleStrings].map((r) => r.toUpperCase().replace(/[\s\._-]/g, ''));
  
  const isSuperAdmin = allRoleStrings.includes('COMPANY') || allRoleStrings.includes('SUPERADMIN');
  const isCmo = allRoleStrings.includes('CMO') || allRoleStrings.includes('ACTIVATECMO') || allRoleStrings.includes('CHIEFMARKETINGOFFICER');
  const isTargetSetter = isSuperAdmin || isCmo;

  function canSee(item: NavItem | NavChild): boolean {
    if (!item.permission) return true;
    return can(item.permission);
  }

  const visibleNav = NAV.map((item) => {
    // Show super-admin dashboard submenu only to super admins; hide regular dashboard link for super admins
    if (item.superAdminOnly && !isSuperAdmin) return null;
    if (item.targetsSetterOnly && !isTargetSetter) return null;
    if (!item.superAdminOnly && item.name === 'Dashboard' && item.href && isSuperAdmin) return null;

    if (item.children) {
      const visibleChildren = item.children.filter((c) => canSee(c));
      if (visibleChildren.length === 0) return null;
      return { ...item, children: visibleChildren };
    }
    if (!canSee(item)) return null;
    return item;
  }).filter(Boolean) as NavItem[];

  const [openGroups, setOpenGroups] = useState<string[]>(() =>
    visibleNav
      .filter((item) => item.children?.some((c) => pathname.startsWith(c.href)))
      .map((item) => item.name)
  );

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname === href || pathname.startsWith(href + '/');
  }

  function isGroupActive(item: NavItem) {
    return item.children?.some((c) => isActive(c.href)) ?? false;
  }

  function toggleGroup(name: string) {
    setOpenGroups((prev) =>
      prev.includes(name) ? prev.filter((g) => g !== name) : [...prev, name]
    );
  }

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {visibleNav.map((item) => {
        const divider = null;

        if (!item.children) {
          const active = item.href ? isActive(item.href) : false;
          const showBadge = item.name === 'Tasks' && typeof pendingCount === 'number' && pendingCount > 0;
          return (
            <div key={item.name}>
              {divider}
              <Link
                href={item.href!}
                onClick={onClose}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center rounded-xl text-[13px] font-semibold transition-colors',
                  collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3',
                  active
                    ? 'bg-white text-[#920793] shadow-sm'
                    : 'text-white/85 hover:bg-white/15 hover:text-white'
                )}
              >
                <div className="relative flex items-center justify-center">
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {showBadge && collapsed && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#920793]" />
                  )}
                </div>
                {!collapsed && <span>{item.name}</span>}
                {showBadge && !collapsed && (
                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            </div>
          );
        }

        const groupActive = isGroupActive(item);
        const open = openGroups.includes(item.name);

        if (collapsed) {
          return (
            <div key={item.name}>
              <div
                className={cn(
                  'flex justify-center p-2.5 rounded-xl',
                  groupActive ? 'bg-white text-[#920793]' : 'text-white/85 hover:bg-white/15'
                )}
              >
                <item.icon className="h-[18px] w-[18px] shrink-0" />
              </div>
            </div>
          );
        }

        return (
          <div key={item.name}>
            {divider}
            <button
              onClick={() => toggleGroup(item.name)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-colors',
                groupActive ? 'bg-white/10 text-white' : 'text-white/85 hover:bg-white/15 hover:text-white'
              )}
            >
              <span className="flex items-center gap-3">
                <item.icon className="h-[18px] w-[18px] shrink-0" />
                {item.name}
              </span>
              {open
                ? <ChevronDown className="h-3.5 w-3.5 text-white/50 shrink-0" />
                : <ChevronRight className="h-3.5 w-3.5 text-white/50 shrink-0" />}
            </button>

            {open && (
              <div className="mt-0.5 ml-4 pl-3 border-l border-white/20 space-y-0.5">
                {item.children!.map((child) => {
                  const active = isActive(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className={cn(
                        'block px-3 py-2 rounded-lg text-[13px] transition-colors',
                        active
                          ? 'bg-white text-[#920793] font-semibold shadow-sm'
                          : 'text-white/75 hover:bg-white/15 hover:text-white'
                      )}
                    >
                      <span>{child.name}</span>
                      {child.description && (
                        <span className={cn('block text-[11px] mt-0.5', active ? 'text-[#920793]/60' : 'text-white/40')}>
                          {child.description}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

interface AppSidebarProps {
  collapsed: boolean;
}

export function AppSidebar({ collapsed }: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex fixed top-0 left-0 h-full flex-col z-40 transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-[260px]'
        )}
        style={{ backgroundColor: '#920793' }}
      >
        <div
          className={cn(
            'flex flex-col items-center justify-center shrink-0 border-b border-white/20 py-4',
            collapsed ? 'px-2' : 'px-5'
          )}
        >
          <img
            src={collapsed ? '/logo/regentlogo.png' : '/logo/regentnewlogo.png'}
            alt="Regent MFB"
            className="h-10 w-auto object-contain"
          />
          {!collapsed && (
            <p className="px-1 text-[10px] font-normal text-white/90 tracking-[0.25em] leading-none mt-1">
              --- Activate ---
            </p>
          )}
        </div>
        <NavLinks onClose={() => {}} collapsed={collapsed} />
      </aside>

      {/* Mobile sidebar navigation handled by BottomNav */}
    </>
  );
}
