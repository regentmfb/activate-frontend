'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft, FolderOpen, Smartphone, Wallet, TrendingUp,
  Mail, Phone, Calendar, Eye, EyeOff, ChevronRight,
} from 'lucide-react';
import { useStaffById } from '../hooks/useStaff';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { formatCurrency, cn } from '@src/utils';
import { useState } from 'react';
import { AccountBreakdown } from '@src/modules/dashboard/components/AccountBreakdown';
import { ROLE_LABELS, ROLE_COLORS, ACCOUNT_TYPE_LABELS } from '@src/constants/labels';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

type Props = { staffId: string };

export function StaffDetail({ staffId }: Props) {
  const router = useRouter();
  const { staff, isLoading } = useStaffById(staffId);
  const { requirePin } = usePinVerification();
  const [portfolioRevealed, setPortfolioRevealed] = useState(false);

  function handleReveal() {
    if (portfolioRevealed) { setPortfolioRevealed(false); return; }
    requirePin('VIEW_PORTFOLIO_VALUE', () => setPortfolioRevealed(true));
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#920793] border-t-transparent" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Staff member not found.</p>
        </div>
      </div>
    );
  }

  const initials = staff.staffName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  // Show customers opened by this RM
  const staffCustomers: any[] = [];

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
            <h1 className="text-[18px] font-black text-gray-900">{staff.staffName}</h1>
            <span className={cn('inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full', ROLE_COLORS[staff.role ?? ''] ?? 'bg-gray-100 text-gray-500')}>
              {ROLE_LABELS[staff.role ?? ''] ?? staff.role}
            </span>
            {staff.teamLeadName && staff.role === 'RM' && (
              <p className="text-[12px] text-gray-500 mt-1.5">Team Lead: {staff.teamLeadName}</p>
            )}
            {staff.cmoName && (
              <p className="text-[12px] text-gray-500 mt-0.5">CMO: {staff.cmoName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Performance stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
            <FolderOpen className="h-4 w-4 text-[#920793]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{staff.accountsOpened}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Accounts Opened</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{staff.mobileOnboarded}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Mobile Onboarded</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center mb-2">
            <Wallet className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{staff.depositCount}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Deposit Count</p>
        </div>
        <button onClick={handleReveal}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-left hover:shadow-md transition-shadow active:scale-[0.98]">
          <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
            <TrendingUp className="h-4 w-4 text-[#920793]" />
          </div>
          <p className="text-2xl font-black text-gray-900">
            {portfolioRevealed ? (() => {
              const val = typeof staff.portfolioValue === 'number' ? staff.portfolioValue : parseFloat((staff.portfolioValue as any) || '0');
              return formatCurrency(isNaN(val) ? 0 : val);
            })() : '••••••'}
          </p>
          <p className="text-[12px] text-gray-500 mt-0.5 flex items-center gap-1">
            {portfolioRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            Portfolio
          </p>
        </button>
      </div>

      {/* Account breakdown */}
      {(staff.accountBreakdown ?? []).length > 0 && (
        <AccountBreakdown items={staff.accountBreakdown ?? []} total={staff.accountsOpened ?? 0} />
      )}

      {/* Staff info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <p className="text-[14px] font-bold text-gray-900">Staff Information</p>
        </div>
        <div className="px-5 py-1">
          {staff.email && (
            <InfoRow label="Email" value={
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" />{staff.email}
              </span>
            } />
          )}
          {staff.phone && (
            <InfoRow label="Phone" value={
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" />{staff.phone}
              </span>
            } />
          )}
          {staff.joinedAt && (
            <InfoRow label="Joined" value={
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                {new Date(staff.joinedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            } />
          )}
          <InfoRow label="Role" value={ROLE_LABELS[staff.role ?? ''] ?? staff.role} />
          {staff.teamLeadName && <InfoRow label="Team Lead" value={staff.teamLeadName} />}
          {staff.cmoName && <InfoRow label="CMO" value={staff.cmoName} />}
        </div>
      </div>

      {/* Customers opened by this RM */}
      {staffCustomers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <p className="text-[14px] font-bold text-gray-900">Customers Opened</p>
            <button onClick={() => router.push('/customers')}
              className="text-[12px] font-semibold text-[#920793] hover:underline">
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {staffCustomers.map((c) => {
              const ci = `${c.firstName[0]}${c.lastName[0]}`.toUpperCase();
              return (
                <button key={c.id} onClick={() => router.push(`/customers/${c.id}`)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>{ci}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900">{c.firstName} {c.lastName}</p>
                    <p className="text-[11px] text-gray-400">{ACCOUNT_TYPE_LABELS[c.accountType] ?? c.accountType} · {c.accountNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('h-1.5 w-1.5 rounded-full', c.mobileOnboarded ? 'bg-green-500' : 'bg-gray-300')} />
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}