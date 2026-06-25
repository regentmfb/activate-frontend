'use client';

import { useCustomerBankOneDetails } from '../hooks/useCustomers';
import type { BankOneDetails } from '../types/customers.types';
import { 
  CheckCircle2, AlertTriangle, RefreshCw, User, Mail, 
  Phone, CreditCard, Wallet, Calendar 
} from 'lucide-react';
import { cn } from '@src/utils';

type Props = {
  customerId: string;
};

export function CustomerBankOneTab({ customerId }: Props) {
  const { data: bankone, isLoading, error, refetch } = useCustomerBankOneDetails(customerId);

  console.log('[CustomerBankOneTab] raw bankone response:', bankone);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <RefreshCw className="h-8 w-8 animate-spin text-[#920793] mb-3" />
        <p className="text-[13px] text-gray-500 font-medium">Fetching BankOne synchronisation details...</p>
      </div>
    );
  }

  if (error || !bankone) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm px-6 text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-[14px] font-bold text-gray-900">Sync Details Unavailable</p>
        <p className="text-[12px] text-gray-500 max-w-sm mt-1 mb-4">
          We couldn't retrieve the BankOne details for this customer. Please try again later.
        </p>
        <button 
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl text-[12px] font-bold text-white bg-[#920793] hover:opacity-90 transition-opacity"
        >
          Retry Fetching
        </button>
      </div>
    );
  }

  // Support alternative casings from BankOne API responses
  const rawBankOne = bankone as any;
  const customerNumber = rawBankOne.customerNumber || rawBankOne.customerID || rawBankOne.customerId || '—';
  
  const fullName = rawBankOne.name || 
    [rawBankOne.firstName, rawBankOne.lastName].filter(Boolean).join(' ') || 
    '—';

  const email = rawBankOne.email || '—';
  const phoneNumber = rawBankOne.phoneNumber || '—';
  
  const bvn = rawBankOne.bvn || rawBankOne.BVN || '—';
  const nin = rawBankOne.nin || rawBankOne.NIN || '—';

  const rawAccounts = rawBankOne.accounts || rawBankOne.Accounts || [];
  const accounts = rawAccounts.map((acc: any) => {
    const balanceStr = acc.availableBalance || acc.ledgerBalance || acc.accountBalance || acc.AccountBalance || '0';
    const balanceNum = typeof balanceStr === 'number' ? balanceStr : parseFloat(balanceStr);
    
    return {
      nuban: acc.NUBAN || '',
      accountNumber: acc.accountNumber || acc.AccountNumber || '—',
      accountName: acc.accountName || acc.AccountName || '—',
      productCode: acc.productCode || acc.ProductCode || '—',
      productName: acc.accountType || acc.productName || acc.ProductName || '—',
      accountBalance: isNaN(balanceNum) ? 0 : balanceNum,
      status: acc.accountStatus || acc.status || acc.Status || '—',
      dateOpened: acc.dateCreated || acc.dateOpened || acc.DateOpened || '',
    };
  });

  const syncStatus = (rawBankOne.syncStatus || (customerNumber && customerNumber !== '—' ? 'SUCCESS' : 'PENDING')) as 'SUCCESS' | 'FAILED' | 'PENDING';
  const lastSyncTime = rawBankOne.lastSyncTime || (syncStatus === 'SUCCESS' ? new Date().toISOString() : undefined);
  const errorMessage = rawBankOne.errorMessage;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const statusConfig = {
    SUCCESS: {
      label: 'Synced',
      bg: 'bg-green-50 border-green-100 text-green-700',
      icon: CheckCircle2,
      desc: 'Customer profile is fully synchronised with BankOne Core.'
    },
    FAILED: {
      label: 'Sync Failed',
      bg: 'bg-red-50 border-red-100 text-red-700',
      icon: AlertTriangle,
      desc: errorMessage || 'An error occurred during Core Banking API synchronisation.'
    },
    PENDING: {
      label: 'Sync Pending',
      bg: 'bg-amber-50 border-amber-100 text-amber-700',
      icon: RefreshCw,
      desc: 'Synchronisation is currently scheduled or in progress.'
    }
  };

  const currentStatus = statusConfig[syncStatus] || statusConfig.PENDING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-4">
      {/* Sync Status Banner */}
      <div className={cn('rounded-2xl border p-4 flex items-start gap-3.5', currentStatus.bg)}>
        <StatusIcon className={cn('h-5 w-5 shrink-0 mt-0.5', syncStatus === 'PENDING' && 'animate-spin')} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[13px] font-bold">{currentStatus.label}</p>
            {lastSyncTime && (
              <span className="text-[11px] font-medium opacity-80">
                Last synced: {new Date(lastSyncTime).toLocaleString('en-NG', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            )}
          </div>
          <p className="text-[12px] opacity-90 mt-1 leading-relaxed">{currentStatus.desc}</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <p className="text-[14px] font-bold text-gray-900">BankOne Customer Info</p>
          <span className="text-[11px] font-mono text-gray-400">ID: {customerNumber || '—'}</span>
        </div>
        <div className="px-5 py-1">
          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-[12px] text-gray-500 font-medium shrink-0">Full Name</span>
            <span className="text-[13px] font-semibold text-gray-900 text-right">
              {fullName}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-[12px] text-gray-500 font-medium shrink-0">Email</span>
            <span className="text-[13px] font-semibold text-gray-900 text-right flex items-center gap-1.5 justify-end">
              <Mail className="h-3.5 w-3.5 text-gray-400" />
              {email || '—'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-[12px] text-gray-500 font-medium shrink-0">Phone Number</span>
            <span className="text-[13px] font-semibold text-gray-900 text-right flex items-center gap-1.5 justify-end">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              {phoneNumber || '—'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-[12px] text-gray-500 font-medium shrink-0">BVN</span>
            <span className="text-[13px] font-mono font-semibold text-gray-900 text-right">
              {bvn || '—'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-50 last:border-0">
            <span className="text-[12px] text-gray-500 font-medium shrink-0">NIN</span>
            <span className="text-[13px] font-mono font-semibold text-gray-900 text-right">
              {nin || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Linked Core Accounts */}
      {false && (
        <div className="space-y-2">
          <p className="text-[13px] font-bold text-gray-900 px-1">Linked Core Accounts ({accounts.length})</p>
          
          {accounts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
              <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-[13px] font-semibold text-gray-900">No core accounts found</p>
              <p className="text-[12px] text-gray-500 mt-1">This customer has no active accounts in BankOne.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {accounts.map((acc: any, idx: number) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-bold text-gray-900">{acc.accountName}</p>
                      <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                        {acc.productName} ({acc.productCode})
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0',
                      acc.status?.toUpperCase() === 'ACTIVE' 
                        ? 'bg-green-50 border-green-200 text-green-700' 
                        : 'bg-amber-50 border-amber-200 text-amber-700'
                    )}>
                      {acc.status}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 pt-2 border-t border-gray-50">
                    <div className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <CreditCard className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-mono font-semibold">NUBAN: {acc.nuban || acc.accountNumber || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-gray-400" />
                        <span>Opened: {formatDate(acc.dateOpened)}</span>
                      </div>
                    </div>
                    {acc.nuban && acc.accountNumber && acc.nuban !== acc.accountNumber && (
                      <div className="text-[10px] text-gray-400 font-mono pl-5">
                        System Ref: {acc.accountNumber}
                      </div>
                    )}
                  </div>

                  <div className="bg-purple-50/50 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1">
                      <Wallet className="h-3.5 w-3.5 text-gray-400" /> Balance
                    </span>
                    <span className="text-[14px] font-black text-[#920793]">
                      ₦{acc.accountBalance?.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
