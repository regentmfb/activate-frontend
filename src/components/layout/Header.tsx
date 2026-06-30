'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, ChevronRight, LogOut, KeyRound, Download } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useAuthStore } from '@/src/store/auth.store';
import { useAuth } from '@/src/modules/auth/hooks/useAuth';
import { ChangePinModal } from '@/src/modules/pin/components/ChangePinModal';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  customers: 'Customers',
  'account-opening': 'Create Account',
  'individual-savings': 'Individual Savings',
  'individual-current': 'Individual Current',
  'select-type': 'Select Type',
  staff: 'Staff',
  'account-upgrade': 'Account Upgrade',
  workflow: 'Workflow',
  reviews: 'Reviews',
  loans: 'Loans',
  new: 'New',
  settings: 'Settings',
  pin: 'PIN',
  targets: 'Targets',
  more: 'More',
};

const BREADCRUMB_LINKS: Record<string, string> = {
  '/account-opening': '/account-opening/select-type',
  '/workflow': '/workflow/compliance',
  '/operations': '/operations/references',
};

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm min-w-0">
      {segments.map((seg, i) => {
        const rawHref = '/' + segments.slice(0, i + 1).join('/');
        const href = BREADCRUMB_LINKS[rawHref] || rawHref;
        const label = SEGMENT_LABELS[seg] ?? seg;
        const isLast = i === segments.length - 1;

        return (
          <span key={seg + i} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
            {isLast ? (
              <span className="font-semibold text-gray-900 truncate">{label}</span>
            ) : (
              <Link href={href} className="text-gray-400 hover:text-gray-600 transition-colors truncate">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const [changePinOpen, setChangePinOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const name = user ? `${user.firstName} ${user.lastName}` : 'User';
  const email = user?.email ?? '';
  const role = user?.roles?.[0]?.name ?? user?.hrmsRoles?.[0] ?? '';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <span className="hidden sm:block text-sm font-medium text-gray-800">{name}</span>
        <div
          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
          style={{ backgroundColor: '#920793' }}
        >
          {initials}
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
            {role && (
              <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-[#920793]">
                {role.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => { setOpen(false); setChangePinOpen(true); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <KeyRound className="h-4 w-4 text-gray-400" />
              Change PIN
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {changePinOpen && <ChangePinModal onClose={() => setChangePinOpen(false)} />}
    </div>
  );
}

function InstallAppButton() {
  const { isStandalone, deferredPrompt, promptInstall, isIOS } = usePWAInstall();
  
  // Show the button if not installed, and we either have the native prompt or it's iOS
  const canInstall = !isStandalone && (deferredPrompt || isIOS);
  
  if (!canInstall) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (deferredPrompt) {
          promptInstall();
        } else if (isIOS) {
          // Reset dismissed state by just reloading the page (state is in memory)
          window.location.reload();
        }
      }}
      className="hidden md:flex items-center gap-2 text-[#920793] border-[#920793]/20 hover:bg-[#920793]/5"
    >
      <Download className="w-4 h-4" />
      Install App
    </Button>
  );
}

interface HeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Header({ collapsed, onToggleCollapse }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b h-14 flex items-center px-4 gap-3">
      {/* Desktop: sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="hidden md:flex text-gray-500 hover:bg-gray-100 shrink-0"
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
      </Button>

      {/* Mobile: logo instead of breadcrumb */}
      <div className="md:hidden flex items-center">
        <Link href="/">
          <img
            src="/logo/regentnewlogo.png"
            alt="Regent MFB"
            className="h-12 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Desktop: breadcrumb */}
      <div className="hidden md:flex">
        <Breadcrumb />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* <InstallAppButton /> */}
        <div className="hidden sm:block w-px h-5 bg-gray-200" />
        <UserMenu />
      </div>
    </header>
  );
}
