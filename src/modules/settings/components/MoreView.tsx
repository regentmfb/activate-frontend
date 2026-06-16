'use client';

import { useRouter } from 'next/navigation';
import {
  Settings, HelpCircle, FileText, Phone, Mail,
  ChevronRight, Info, Shield, ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '@src/store/auth.store';
import { cn } from '@src/utils';

type LinkItem = {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  external?: boolean;
};

function LinkRow({ item }: { item: LinkItem }) {
  const router = useRouter();

  function handleClick() {
    if (item.external && item.href) { window.open(item.href, '_blank'); return; }
    if (item.href) router.push(item.href);
  }

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left"
    >
      <div className="h-9 w-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
        <item.icon className="h-4 w-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-gray-900">{item.label}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{item.description}</p>
      </div>
      {item.external
        ? <ExternalLink className="h-4 w-4 text-gray-300 shrink-0" />
        : <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />}
    </button>
  );
}

export function MoreView() {
  const user = useAuthStore((s) => s.user);
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

  const QUICK_LINKS: LinkItem[] = [
    { icon: Settings,  label: 'Settings',       description: 'Account, PIN, and preferences',    href: '/settings' },
    { icon: Shield,    label: 'Permissions',     description: 'View your role and access level',  href: '/more' },
    { icon: FileText,  label: 'Activity Log',    description: 'Your recent actions and history',  href: '/more/activity-logs' },
  ];

  const SUPPORT_LINKS: LinkItem[] = [
    { icon: HelpCircle, label: 'Help Centre',     description: 'FAQs and how-to guides',                    href: '/more' },
    { icon: Phone,      label: 'Call Support',    description: '+234 800 REGENT (734368)',                   href: 'tel:+2348007343368', external: true },
    { icon: Mail,       label: 'Email Support',   description: 'support@regentmfb.com',                     href: 'mailto:support@regentmfb.com', external: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">More</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">Quick access and support</p>
      </div>

      {/* Profile summary */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-gray-900">{fullName}</p>
          <p className="text-[12px] text-gray-500 truncate">{user?.email}</p>
        </div>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-100 text-[#920793] shrink-0">
          {role}
        </span>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Quick Links</p>
        </div>
        {QUICK_LINKS.map((item) => <LinkRow key={item.label} item={item} />)}
      </div>

      {/* Support */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Support</p>
        </div>
        {SUPPORT_LINKS.map((item) => <LinkRow key={item.label} item={item} />)}
      </div>

      {/* App info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">About</p>
        </div>
        <div className="px-5 py-4 space-y-2.5">
          {[
            ['App Name',    'RegentMFB Activate'],
            ['Version',     '1.0.0 (V1 MVP)'],
            ['Platform',    'Progressive Web App'],
            ['Environment', 'Development'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[13px] text-gray-500">{label}</span>
              <span className="text-[13px] font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[12px] text-gray-400 pb-2">
        © {new Date().getFullYear()} Regent Microfinance Bank. All rights reserved.
      </p>
    </div>
  );
}
