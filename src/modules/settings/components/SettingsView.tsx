'use client';

import { useRouter } from 'next/navigation';
import { ChevronRight, Lock, LogOut, User, Shield, Bell, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@src/store/auth.store';
import { useAuth } from '@src/modules/auth/hooks/useAuth';
import { cn } from '@src/utils';

type SettingsItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  action?: () => void;
  danger?: boolean;
  badge?: string;
};

function SettingsRow({ item }: { item: SettingsItem }) {
  const router = useRouter();

  function handleClick() {
    if (item.action) { item.action(); return; }
    if (item.href) router.push(item.href);
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left',
        item.danger && 'hover:bg-red-50'
      )}
    >
      <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', item.danger ? 'bg-red-50' : 'bg-gray-100')}>
        <item.icon className={cn('h-4 w-4', item.danger ? 'text-red-500' : 'text-gray-600')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[14px] font-semibold', item.danger ? 'text-red-500' : 'text-gray-900')}>{item.label}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{item.description}</p>
      </div>
      {item.badge && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">{item.badge}</span>
      )}
      {!item.danger && <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />}
    </button>
  );
}

export function SettingsView() {
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';
  const initials = fullName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  
  // Extract primary role from hrmsRoles array
  const getPrimaryRole = () => {
    if (!user?.hrmsRoles || user.hrmsRoles.length === 0) return '';
    const priority = ['SUPER_ADMIN', 'MD', 'CMO', 'TEAM_LEAD', 'OPERATIONS', 'INTERNAL_CONTROL', 'RM', 'ACCOUNT_OFFICER', 'TELLER'];
    for (const role of priority) {
      if (user.hrmsRoles.includes(role)) return role;
    }
    return user.hrmsRoles[0];
  };
  
  const role = getPrimaryRole().replace(/_/g, ' ');

  const ACCOUNT_ITEMS: SettingsItem[] = [
    { icon: User,       label: 'Profile',        description: 'View your staff profile and details',          href: '/settings' },
    { icon: Lock,       label: 'PIN Settings',   description: 'Set or change your verification PIN',          href: '/settings/pin' },
    { icon: Shield,     label: 'Security',       description: 'Manage your account security settings',        href: '/settings', badge: 'Soon' },
    { icon: Bell,       label: 'Notifications',  description: 'Configure push and in-app notifications',      href: '/settings', badge: 'Soon' },
  ];

  const SUPPORT_ITEMS: SettingsItem[] = [
    { icon: HelpCircle, label: 'Help & Support', description: 'Get help or contact the support team',         href: '/more' },
    { icon: LogOut,     label: 'Logout',         description: 'Sign out of your Activate account',            action: logout, danger: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">Settings</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile card */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[18px] font-black text-gray-900">{fullName}</p>
          <p className="text-[13px] text-gray-500 mt-0.5 truncate">{user?.email}</p>
          <span className="inline-block mt-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-[#920793]">
            {role}
          </span>
        </div>
      </div>

      {/* Account settings */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Account</p>
        </div>
        {ACCOUNT_ITEMS.map((item) => <SettingsRow key={item.label} item={item} />)}
      </div>

      {/* Support & logout */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Support</p>
        </div>
        {SUPPORT_ITEMS.map((item) => <SettingsRow key={item.label} item={item} />)}
      </div>

      <p className="text-center text-[12px] text-gray-400">RegentMFB Activate · Version 1.0.0</p>
    </div>
  );
}
