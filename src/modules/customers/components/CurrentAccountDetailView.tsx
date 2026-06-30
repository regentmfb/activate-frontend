'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Wallet, Eye, EyeOff, Phone, Mail,
  CreditCard, MapPin, User, Calendar, CheckCircle2,
  Clock, TrendingUp, Briefcase, ArrowUpCircle
} from 'lucide-react';
import { formatCurrency, cn } from '@src/utils';
import { CustomerDetailResponse } from '../types/customers.types';
import { CustomerInflowsTab } from './CustomerInflowsTab';
import { CustomerBankOneTab } from './CustomerBankOneTab';

type Tab = 'overview' | 'biodata' | 'account' | 'activity' | 'inflows' | 'bankone';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value ?? '—'}</span>
    </div>
  );
}

function TierBadge({ tier }: { tier: number | string }) {
  const num = typeof tier === 'string' ? parseInt(tier.replace(/\D/g, '')) : tier;
  const colors: Record<number, string> = {
    1: 'bg-blue-50 text-blue-700',
    2: 'bg-purple-50 text-[#920793]',
    3: 'bg-amber-50 text-amber-700'
  };
  return (
    <span className={cn('text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap', colors[num] ?? colors[1])}>
      Tier {num}
    </span>
  );
}

function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <p className="text-[14px] font-bold text-gray-900">{title}</p>
        {action}
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function RevealButton({ revealed, onToggle }: { revealed: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#920793] hover:underline">
      {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {revealed ? 'Hide' : 'Reveal (PIN)'}
    </button>
  );
}

type Props = {
  data: CustomerDetailResponse;
  id: string;
  accountId: string;
  biodataRevealed: boolean;
  balanceRevealed: boolean;
  onRevealBiodata: () => void;
  onRevealBalance: () => void;
  revealToken?: string;
};

export function CurrentAccountDetailView({ 
  data, 
  id, 
  accountId,
  biodataRevealed,
  balanceRevealed,
  onRevealBiodata,
  onRevealBalance,
  revealToken
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');

  const { overview, biodata, account, activity } = data;
  const fullName = biodata?.fullName || data.name || '—';
  const initials = fullName.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const tier = overview?.accountTier ?? 1;
  const upgradeBanner = account?.upgradeTierBanner;
  
  const isPending = !account?.accountNumber || account.accountNumber.toLowerCase() === 'pending' || account.accountNumber === 'N/A';
  const hasDeposit = account?.depositStatus?.toLowerCase().includes('no') === false;

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'biodata', label: 'Biodata' },
    { key: 'account', label: 'Account' },
    { key: 'inflows', label: 'Inflows' },
    { key: 'activity', label: 'Activity' },
    { key: 'bankone', label: 'BankOne Sync' },
  ];

  return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Profile header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-black text-gray-900">{fullName}</h1>
              <TierBadge tier={tier} />
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-[#920793]">
                CURRENT ACCOUNT
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {account?.accountNumber && account.accountNumber !== 'N/A' && account.accountNumber !== 'Pending' ? account.accountNumber : 'Pending Approval'}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {isPending ? (
                <span className="flex items-center gap-1 text-[12px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  <Clock className="h-3.5 w-3.5" />
                  Awaiting Core Approval
                </span>
              ) : (
                <span className={cn('flex items-center gap-1 text-[12px] font-medium', hasDeposit ? 'text-green-600' : 'text-gray-400')}>
                  <Wallet className="h-3.5 w-3.5" />
                  {account?.depositStatus ?? '—'}
                </span>
              )}
            </div>
          </div>
        </div>
        {upgradeBanner && (
          <div className="flex gap-2 mt-4">
            <button
              disabled={!!upgradeBanner.status || isPending}
              onClick={() => router.push(`/account-upgrade/${id}?from=customer&currentTier=${tier}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ArrowUpCircle className="h-3.5 w-3.5" />
              {upgradeBanner.status ? `Processing Tier ${upgradeBanner.targetTier} Upgrade...` : `Upgrade to Tier ${upgradeBanner.targetTier}`}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex-1 min-w-fit px-4 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap',
              tab === t.key ? 'bg-white text-[#920793] shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-[22px] font-black text-gray-900">{tier}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Account Tier</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-[18px] font-black text-gray-900 truncate">{formatCurrency(account?.depositCount ?? 0)}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Total Deposits</p>
            </div>
            <button onClick={onRevealBalance} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow active:scale-[0.98]">
              <p className="text-[18px] font-black text-gray-900 truncate">
                {balanceRevealed ? account?.portfolioValue : '••••'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> Portfolio
              </p>
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-1">
            <InfoRow label="Date Opened" value={account?.dateOpened} />
            <InfoRow label="Account Type" value="INDIVIDUAL CURRENT" />
            <InfoRow label="Account Number" value={
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                {account?.accountNumber && account.accountNumber !== 'N/A' && account.accountNumber !== 'Pending' ? account.accountNumber : 'Pending'}
              </span>
            } />
            <InfoRow label="Approval Status" value={
              <span className={cn('flex items-center gap-1', isPending ? 'text-amber-600' : 'text-green-600')}>
                {isPending ? <Clock className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                {isPending ? 'Pending Core Review' : 'Active'}
              </span>
            } />
          </div>
        </div>
      )}

      {/* Biodata */}
      {tab === 'biodata' && (
        <div className="space-y-3">
          <Section title="Personal Information" action={<RevealButton revealed={biodataRevealed} onToggle={onRevealBiodata} />}>
            <InfoRow label="Full Name" value={biodata?.fullName} />
            <InfoRow label="Gender" value={<span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-gray-400" />{biodata?.gender}</span>} />
            <InfoRow label="Date of Birth" value={
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {biodata?.dateOfBirth}
              </span>
            } />
            <InfoRow label="Phone" value={<span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gray-400" />{biodata?.phoneNumber}</span>} />
            <InfoRow label="Email" value={<span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-gray-400" />{biodata?.email}</span>} />
            <InfoRow label="Address" value={<span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" />{biodata?.address}</span>} />
          </Section>
          <Section title="Identity Numbers" action={<RevealButton revealed={biodataRevealed} onToggle={onRevealBiodata} />}>
            <InfoRow label="BVN" value={biodata?.bvn} />
            <InfoRow label="NIN" value={biodata?.nin} />
          </Section>
        </div>
      )}

      {/* Account */}
      {tab === 'account' && (
        <div className="space-y-3">
          <Section title="Current Account Information">
            <InfoRow label="Account Number" value={<span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-gray-400" />{account?.accountNumber || 'Pending'}</span>} />
            <InfoRow label="Account Type" value="INDIVIDUAL CURRENT" />
            <InfoRow label="Current Tier" value={<TierBadge tier={account?.currentTier ?? tier} />} />
            <InfoRow label="Date Opened" value={account?.dateOpened} />
          </Section>
          <Section title="Balance & Deposits" action={<RevealButton revealed={balanceRevealed} onToggle={onRevealBalance} />}>
            <InfoRow label="Portfolio Value" value={balanceRevealed ? account?.portfolioValue : '••••••'} />
            <InfoRow label="Deposit Value" value={formatCurrency(account?.depositCount ?? 0)} />
            <InfoRow label="Deposit Status" value={
              <span className={cn('flex items-center gap-1 text-[12px] font-semibold', hasDeposit ? 'text-green-600' : 'text-gray-400')}>
                {hasDeposit ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                {account?.depositStatus}
              </span>
            } />
          </Section>
          {upgradeBanner && (
            <div className="bg-purple-50 rounded-2xl border border-purple-100 p-4 flex items-start gap-3">
              <ArrowUpCircle className="h-5 w-5 text-[#920793] shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#920793]">{upgradeBanner.title}</p>
                <p className="text-[12px] text-purple-700 mt-0.5">{upgradeBanner.description}</p>
                <button
                  disabled={!!upgradeBanner.status || isPending}
                  onClick={() => router.push(`/account-upgrade/${id}?from=customer&currentTier=${tier}`)}
                  className="mt-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white bg-[#920793] hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {upgradeBanner.status ? `Processing Tier ${upgradeBanner.targetTier} Upgrade...` : 'Start Upgrade'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inflows */}
      {tab === 'inflows' && (
        <CustomerInflowsTab customerId={id} revealToken={revealToken ?? undefined} />
      )}

      {/* Activity */}
      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {!activity?.length ? (
            <div className="p-8 text-center">
              <p className="text-[14px] text-gray-400">No activity recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {[...activity].reverse().map((item, i) => (
                <div key={i} className="flex items-start gap-4 px-5 py-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-[#920793]" />
                    </div>
                    {i < activity.length - 1 && (
                      <div className="w-px flex-1 min-h-[16px] mt-1 bg-gray-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-[13px] font-semibold text-gray-900">{item.event}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{item.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* BankOne Sync */}
      {tab === 'bankone' && (
        <CustomerBankOneTab customerId={id} />
      )}
    </div>
  );
}
