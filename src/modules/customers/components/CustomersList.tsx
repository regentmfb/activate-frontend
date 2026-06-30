'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Users, Smartphone, Wallet, TrendingUp, ChevronRight } from 'lucide-react';
import { useCustomers } from '../hooks/useCustomers';
import { usePermissions } from '@src/hooks/usePermissions';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { Customer } from '../types/customers.types';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { ACCOUNT_TYPE_LABELS } from '@src/constants/labels';

function TierBadge({ tier }: { tier: number }) {
  const colors: Record<number, string> = {
    1: 'bg-blue-50 text-blue-700',
    2: 'bg-purple-50 text-[#920793]',
    3: 'bg-amber-50 text-amber-700'
  };

  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', colors[tier] ?? colors[1])}>
      Tier {tier}
    </span>
  );
}

function AccountTypeBadge({ type }: { type: string }) {
  const isCurrent = type?.includes('CURRENT');
  return (
    <span className={cn(
      'px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap',
      isCurrent ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-[#920793]'
    )}>
      {ACCOUNT_TYPE_LABELS[type] ?? type}
    </span>
  );
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className={cn('flex items-center gap-1 text-[11px] font-medium', active ? 'text-green-600' : 'text-gray-400')}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', active ? 'bg-green-500' : 'bg-gray-300')} />
      {label}
    </span>
  );
}

export function CustomersList() {
  const router = useRouter();
  const { customers, allCustomers, search, setSearch, isLoading, mobileOnboardedCount, withDepositCount, totalPortfolioValue, portfolioRevealed } = useCustomers();
  const { requirePin } = usePinVerification();
  const { role } = usePermissions();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const [portfolioRevealedLocal, setPortfolioRevealedLocal] = useState(false);
  const [activeTab, setActiveTab] = useState<'SAVINGS' | 'CURRENT'>('SAVINGS');

  console.log('[DEBUG] Customers loaded in UI:', customers);

  // Use server-revealed value if token is active, otherwise use local toggle
  const showPortfolio = portfolioRevealed || portfolioRevealedLocal;

  function handleRevealPortfolio() {
    if (showPortfolio) { setPortfolioRevealedLocal(false); return; }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealedLocal(true));
  }

  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (c) => {
        const initials = `${c.firstName?.[0] ?? '?'}${c.lastName?.[0] ?? ''}`.toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
              {initials}
            </div>
            <span className="font-medium text-gray-900 whitespace-nowrap">{c.fullName || `${c.firstName} ${c.lastName}`}</span>
          </div>
        );
      },
    },
    {
      key: 'accountType',
      header: 'Account Type',
      render: (c) => <AccountTypeBadge type={c.accountType} />,
    },
    {
      key: 'accountNumber',
      header: 'Account No.',
      render: (c) => {
        const isPending = !c.accountNumber || c.accountNumber === 'N/A' || c.accountNumber.toLowerCase() === 'pending';
        return (
          <span className={cn(
            'font-mono text-[13px] px-2 py-0.5 rounded font-semibold',
            isPending ? 'text-amber-600 bg-amber-50' : 'text-slate-700 bg-slate-100 border border-slate-200'
          )}>
            {isPending ? 'Pending' : c.accountNumber}
          </span>
        );
      },
    },
    {
      key: 'accountOfficer',
      header: 'Account Officer',
      render: (c) => <span className="text-gray-500 whitespace-nowrap text-[13px] font-medium">{c.accountOfficer || '—'}</span>,
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (c) => <TierBadge tier={c.tier} />,
    },
    {
      key: 'mobile',
      header: 'Mobile',
      render: (c) => <StatusDot active={c.mobileOnboarded} label={c.mobileOnboarded ? 'Active' : 'Not onboarded'} />,
    },
    {
      key: 'deposit',
      header: 'Deposit',
      render: (c) => <StatusDot active={c.hasDeposit} label={c.hasDeposit ? 'Has deposit' : 'No deposit'} />,
    },
    {
      key: 'action',
      header: '',
      render: (c) => (
        <button
          onClick={() => router.push(`/customers/${c.id}?accountId=${c.requestId}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap"
        >
          View <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  function renderCard(customer: Customer) {
    const initials = `${customer.firstName?.[0] ?? '?'}${customer.lastName?.[0] ?? ''}`.toUpperCase();
    return (
      <button
        onClick={() => router.push(`/customers/${customer.id}?accountId=${customer.requestId}`)}
        className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98] text-left"
      >
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-gray-900">{customer.fullName || `${customer.firstName} ${customer.lastName}`}</p>
            <TierBadge tier={customer.tier} />
          </div>
          <div className="text-[12px] text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
            <AccountTypeBadge type={customer.accountType} />
            <span className={cn(
              'font-mono text-[11px] px-1.5 py-0.5 rounded font-semibold',
              (!customer.accountNumber || customer.accountNumber === 'N/A' || customer.accountNumber.toLowerCase() === 'pending')
                ? 'text-amber-600 bg-amber-50'
                : 'text-slate-700 bg-slate-100 border border-slate-200'
            )}>
              {(!customer.accountNumber || customer.accountNumber === 'N/A' || customer.accountNumber.toLowerCase() === 'pending') ? 'Pending' : customer.accountNumber}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Officer: <span className="font-medium text-gray-600">{customer.accountOfficer || '—'}</span>
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <StatusDot active={customer.mobileOnboarded} label={customer.mobileOnboarded ? 'Mobile' : 'Not onboarded'} />
            <StatusDot active={customer.hasDeposit} label={customer.hasDeposit ? 'Has deposit' : 'No deposit'} />
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
      </button>
    );
  }

  const filteredCustomers = customers.filter(c => {
    if (activeTab === 'SAVINGS') return c.accountType.includes('SAVINGS');
    if (activeTab === 'CURRENT') return c.accountType.includes('CURRENT');
    return true;
  });
  const savingsCount = allCustomers.filter(c => c.accountType.includes('SAVINGS')).length;
  const currentCount = allCustomers.filter(c => c.accountType.includes('CURRENT')).length;
  const uniqueCustomersCount = new Set(allCustomers.map(c => c.id)).size;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">{isSuperAdmin ? 'Customers' : 'My Customers'}</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">{uniqueCustomersCount} {isSuperAdmin ? 'customers in the system' : 'customers opened through your Activate'}</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
            <Users className="h-4 w-4 text-[#920793]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{uniqueCustomersCount}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Total Customers</p>
        </div>
        
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{savingsCount}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Total Savings</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center mb-2">
            <Wallet className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{currentCount}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Total Current</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-orange-50 flex items-center justify-center mb-2">
            <Smartphone className="h-4 w-4 text-orange-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{mobileOnboardedCount}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Mobile Onboarded</p>
        </div>

        {/* 
        <button
          onClick={handleRevealPortfolio}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left hover:shadow-md transition-shadow active:scale-[0.98]"
        >
          <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
            <TrendingUp className="h-4 w-4 text-[#920793]" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {showPortfolio ? formatCurrency(totalPortfolioValue) : '••••••'}
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5">Portfolio Value</p>
        </button>
        */}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-px">
        {(['SAVINGS', 'CURRENT'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2.5 text-[13px] font-semibold transition-all relative",
              activeTab === tab
                ? "text-[#920793]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === 'SAVINGS' ? 'Savings Accounts' : 'Current Accounts'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#920793] rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or account number..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent"
        />
      </div>

      <DataView
        data={filteredCustomers}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={(c) => c.requestId || c.id}
        title={`${filteredCustomers.length} ${filteredCustomers.length === 1 ? 'Account' : 'Accounts'}`}
        emptyMessage="No accounts found."
        gridCols="grid-cols-1 sm:grid-cols-2"
        isLoading={isLoading}
      />
    </div>
  );
}
