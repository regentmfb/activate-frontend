'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Smartphone, Wallet, Eye, EyeOff, Phone, Mail,
  CreditCard, ArrowUpCircle, MapPin, User, Calendar, CheckCircle2,
  Clock, TrendingUp, Shield,
} from 'lucide-react';
import { useCustomerById } from '../hooks/useCustomers';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { LienRequestForm } from '@src/modules/lien/components/LienRequestForm';
import { CustomerInflowsTab } from './CustomerInflowsTab';
import { CustomerBankOneTab } from './CustomerBankOneTab';

type Tab = 'overview' | 'biodata' | 'account' | 'activity' | 'inflows' | 'lien' | 'bankone';

function TierBadge({ tier }: { tier: number | string }) {
  const num = typeof tier === 'string' ? parseInt(tier.replace(/\D/g, '')) : tier;
  const styles: Record<number, string> = {
    1: 'bg-gray-100 text-gray-500',
    2: 'bg-blue-50 text-blue-600',
    3: 'bg-purple-50 text-[#920793]',
  };
  return (
    <span className={cn('text-[11px] font-bold px-2.5 py-1 rounded-full', styles[num] ?? styles[1])}>
      Tier {num}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium shrink-0">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value ?? '—'}</span>
    </div>
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

type Props = { id: string };

export function CustomerDetail({ id }: Props) {
  const router = useRouter();
  const { requirePin, revealToken } = usePinVerification();
  const [tab, setTab] = useState<Tab>('overview');
  const [biodataRevealed, setBiodataRevealed] = useState(false);
  const [balanceRevealed, setBalanceRevealed] = useState(false);

  const activeRevealToken = (biodataRevealed || balanceRevealed) ? (revealToken ?? undefined) : undefined;
  const { customer: data, isLoading } = useCustomerById(id, activeRevealToken);

  function handleRevealBiodata() {
    if (biodataRevealed) { setBiodataRevealed(false); return; }
    requirePin('VIEW_CUSTOMER_BIODATA', () => setBiodataRevealed(true));
  }

  function handleRevealBalance() {
    if (balanceRevealed) { setBalanceRevealed(false); return; }
    requirePin('VIEW_BALANCE', () => setBalanceRevealed(true));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#920793] border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Customer not found.</p>
        </div>
      </div>
    );
  }

  const { overview, biodata, account, activity } = data;
  const fullName = biodata?.fullName || data.name || '—';
  const initials = fullName.split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  const tier = overview?.accountTier ?? 1;
  const isMobileActive = overview?.mobileAppStatus?.toLowerCase().includes('activ') ?? false;
  const hasDeposit = overview?.depositStatus?.toLowerCase().includes('no') === false;
  const upgradeBanner = account?.upgradeTierBanner;
  console.log('upgradeBanner in frontend:', upgradeBanner);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'biodata', label: 'Biodata' },
    { key: 'account', label: 'Account' },
    { key: 'inflows', label: 'Inflows' },
    { key: 'activity', label: 'Activity' },
    { key: 'lien', label: 'Lien' },
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
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[18px] font-black text-gray-900">{fullName}</h1>
              <TierBadge tier={tier} />
            </div>
            <p className="text-[13px] text-gray-500 mt-0.5">
              {overview?.accountType} · {overview?.accountNumber ?? '—'}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className={cn('flex items-center gap-1 text-[12px] font-medium', isMobileActive ? 'text-green-600' : 'text-gray-400')}>
                <Smartphone className="h-3.5 w-3.5" />
                {overview?.mobileAppStatus ?? 'Unknown'}
              </span>
              <span className={cn('flex items-center gap-1 text-[12px] font-medium', hasDeposit ? 'text-green-600' : 'text-gray-400')}>
                <Wallet className="h-3.5 w-3.5" />
                {overview?.depositStatus ?? '—'}
              </span>
            </div>
          </div>
        </div>
        {upgradeBanner && (
          <div className="flex gap-2 mt-4">
            <button
              disabled={!!upgradeBanner.status}
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
              <p className="text-[18px] font-black text-gray-900 truncate">{formatCurrency(overview?.depositsCount ?? 0)}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Total Deposits</p>
            </div>
            <button onClick={handleRevealBalance} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center hover:shadow-md transition-shadow active:scale-[0.98]">
              <p className="text-[18px] font-black text-gray-900 truncate">
                {balanceRevealed ? overview?.portfolioValue : '••••'}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 flex items-center justify-center gap-1">
                <TrendingUp className="h-3 w-3" /> Portfolio
              </p>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className={cn('rounded-2xl p-4 border flex items-center gap-3', isMobileActive ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100')}>
              <Smartphone className={cn('h-5 w-5 shrink-0', isMobileActive ? 'text-green-600' : 'text-gray-400')} />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Mobile App</p>
                <p className={cn('text-[11px] font-medium', isMobileActive ? 'text-green-600' : 'text-gray-400')}>
                  {overview?.mobileAppStatus}
                </p>
              </div>
            </div>
            <div className={cn('rounded-2xl p-4 border flex items-center gap-3', hasDeposit ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100')}>
              <Wallet className={cn('h-5 w-5 shrink-0', hasDeposit ? 'text-green-600' : 'text-gray-400')} />
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Deposit</p>
                <p className={cn('text-[11px] font-medium', hasDeposit ? 'text-green-600' : 'text-gray-400')}>
                  {overview?.depositStatus}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-1">
            <InfoRow label="Date Opened" value={overview?.dateOpened} />
            <InfoRow label="Account Type" value={overview?.accountType} />
            <InfoRow label="Account Number" value={
              <span className="flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                {overview?.accountNumber ?? '—'}
              </span>
            } />
          </div>
        </div>
      )}

      {/* Biodata */}
      {tab === 'biodata' && (
        <div className="space-y-3">
          <Section title="Personal Information" action={<RevealButton revealed={biodataRevealed} onToggle={handleRevealBiodata} />}>
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
          <Section title="Identity Numbers" action={<RevealButton revealed={biodataRevealed} onToggle={handleRevealBiodata} />}>
            <InfoRow label="BVN" value={biodata?.bvn} />
            <InfoRow label="NIN" value={biodata?.nin} />
          </Section>
        </div>
      )}

      {/* Account */}
      {tab === 'account' && (
        <div className="space-y-3">
          <Section title="Account Information">
            <InfoRow label="Account Number" value={<span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-gray-400" />{account?.accountNumber}</span>} />
            <InfoRow label="Account Type" value={account?.accountType} />
            <InfoRow label="Current Tier" value={<TierBadge tier={account?.currentTier ?? tier} />} />
            <InfoRow label="Date Opened" value={account?.dateOpened} />
          </Section>
          <Section title="Balance & Deposits" action={<RevealButton revealed={balanceRevealed} onToggle={handleRevealBalance} />}>
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
                  disabled={!!upgradeBanner.status}
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

      {/* Lien Control */}
      {tab === 'lien' && (
        <div className="space-y-3">
          <Section title="Lien Request">
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-5 w-5 text-[#920793]" />
                <div>
                  <p className="text-[14px] font-semibold text-gray-900">Request Lien Placement</p>
                  <p className="text-[12px] text-gray-500">Submit a lien request — it will go through Team Lead → CMO → Operations</p>
                </div>
              </div>
              {account?.accountNumber ? (
                <LienRequestForm
                  accountNumber={account.accountNumber}
                  accountId={account.id}
                  customerId={id}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-[13px] text-gray-500">Account number not available for lien operations</p>
                </div>
              )}
            </div>
          </Section>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-amber-800">Approval Required</p>
              <p className="text-[12px] text-amber-700 mt-0.5">
                Lien requests must be approved by your Team Lead and CMO before Operations can place them.
                Ensure you have the proper authorisation before submitting.
              </p>
            </div>
          </div>
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
