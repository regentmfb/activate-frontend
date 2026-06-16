'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, PiggyBank, CreditCard, Lock } from 'lucide-react';
import { Permission } from '@src/constants/permissions';
import { usePermissions } from '@src/hooks/usePermissions';
import { cn } from '@src/utils';

type AccountOption = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  permission?: Permission;
  badge?: string;
};

const INDIVIDUAL_ACCOUNTS: AccountOption[] = [
  {
    label: 'Individual Savings',
    description: 'Standard savings account for individual customers.',
    href: '/account-opening/individual-savings',
    icon: PiggyBank,
    iconBg: '#f5e6f5',
    iconColor: '#920793',
    permission: 'CAN_OPEN_ACCOUNT',
  },
  {
    label: 'Individual Current',
    description: 'Current account with cheque book and higher transaction limits.',
    href: '/account-opening/individual-current',
    icon: CreditCard,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    permission: 'CAN_OPEN_ACCOUNT',
  },
  {
    label: 'Target Savings',
    description: 'Goal-based savings account with a target amount.',
    href: '#',
    icon: PiggyBank,
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
    permission: 'CAN_OPEN_ACCOUNT',
    badge: 'Coming Soon',
  },
  {
    label: 'Kiddies Account',
    description: 'Savings account designed for children.',
    href: '#',
    icon: PiggyBank,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
    permission: 'CAN_OPEN_ACCOUNT',
    badge: 'Coming Soon',
  },
  {
    label: 'Fixed Deposit',
    description: 'High-yield fixed deposit account (Treasury).',
    href: '#',
    icon: PiggyBank,
    iconBg: '#fce7f3',
    iconColor: '#db2777',
    permission: 'CAN_OPEN_ACCOUNT',
    badge: 'Coming Soon',
  },
];

const CORPORATE_ACCOUNTS: AccountOption[] = [
  {
    label: 'Corporate Savings',
    description: 'Premium savings account for businesses and organisations.',
    href: '#',
    icon: CreditCard,
    iconBg: '#f5e6f5',
    iconColor: '#920793',
    permission: 'CAN_OPEN_ACCOUNT',
    badge: 'Coming Soon',
  },
  {
    label: 'Corporate Current',
    description: 'Full-featured current account for corporate entities.',
    href: '#',
    icon: CreditCard,
    iconBg: '#e0f2fe',
    iconColor: '#0284c7',
    permission: 'CAN_OPEN_ACCOUNT',
    badge: 'Coming Soon',
  },
];

function AccountCard({ option }: { option: AccountOption }) {
  const router = useRouter();
  const { can } = usePermissions();
  const allowed = !option.permission || can(option.permission);
  const isComingSoon = option.badge === 'Coming Soon';
  const disabled = !allowed || isComingSoon;

  function handleClick() {
    if (disabled) return;
    router.push(option.href);
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full text-left bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3 transition-all',
        !disabled && 'hover:shadow-md hover:border-purple-100 active:scale-[0.98] cursor-pointer',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: option.iconBg }}
        >
          {!allowed ? (
            <Lock className="h-5 w-5" style={{ color: option.iconColor }} />
          ) : (
            <option.icon className="h-5 w-5" style={{ color: option.iconColor }} />
          )}
        </div>
        {option.badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 uppercase tracking-wide shrink-0">
            {option.badge}
          </span>
        )}
        {!allowed && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500 uppercase tracking-wide shrink-0">
            No Permission
          </span>
        )}
      </div>
      <div>
        <p className="text-[14px] font-semibold text-gray-900">{option.label}</p>
        <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{option.description}</p>
      </div>
    </button>
  );
}

export default function SelectAccountTypePage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      <div>
        <h1 className="text-[22px] font-black text-gray-900">Open Account</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">Select the type of account to open for your customer.</p>
      </div>

      <div className="space-y-3">
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Individual Accounts</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {INDIVIDUAL_ACCOUNTS.map((opt) => (
            <AccountCard key={opt.label} option={opt} />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Corporate Accounts</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CORPORATE_ACCOUNTS.map((opt) => (
            <AccountCard key={opt.label} option={opt} />
          ))}
        </div>
      </div>
    </div>
  );
}
