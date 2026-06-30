'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Server, AlertCircle, Check, Loader2, Info } from 'lucide-react';
import { regentCoreApi, FailedSyncRecord, SuccessfulSyncRecord } from '../api/regent-core.api';
import { cn } from '@src/utils';
import { format } from 'date-fns';

export function CoreSyncView() {
  const [failedRecords, setFailedRecords] = useState<FailedSyncRecord[]>([]);
  const [successfulRecords, setSuccessfulRecords] = useState<SuccessfulSyncRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'failed' | 'successful'>('failed');
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  async function loadRecords() {
    setLoading(true);
    setErrorMsg('');
    try {
      if (activeTab === 'failed') {
        const records = await regentCoreApi.getFailedSyncs();
        setFailedRecords(records);
      } else {
        const records = await regentCoreApi.getSuccessfulSyncs();
        setSuccessfulRecords(records);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to load sync records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRecords();
  }, [activeTab]);

  async function handleRetry() {
    if (failedRecords.length === 0) return;
    setRetrying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const result = await regentCoreApi.retryFailedSyncs();
      if (result.failed > 0) {
        setErrorMsg(`Processed ${result.processed} records. ${result.succeeded} succeeded, ${result.failed} failed.`);
      } else {
        setSuccessMsg(`Successfully retried and synced ${result.succeeded} records.`);
        setTimeout(() => setSuccessMsg(''), 5000);
      }
      await loadRecords();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to retry sync.');
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-black text-gray-900 flex items-center gap-2">
          <Server className="h-6 w-6 text-[#920793]" />
          Regent Core Synchronization
        </h1>
        <p className="text-[14px] text-gray-500 mt-0.5">
          View and manually retry failed webhooks and API syncs to the central Regent Core platform.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col min-h-[480px]">
        <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('failed')}
              className={cn(
                'text-sm font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 transition-all',
                activeTab === 'failed' ? 'border-orange-500 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <AlertCircle className={cn("h-4 w-4", activeTab === 'failed' ? "text-orange-500" : "text-gray-400")} />
              Failed Syncs {activeTab === 'failed' && `(${failedRecords.length})`}
            </button>
            <button
              onClick={() => setActiveTab('successful')}
              className={cn(
                'text-sm font-bold uppercase tracking-wider flex items-center gap-2 pb-1 border-b-2 transition-all',
                activeTab === 'successful' ? 'border-green-500 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
              )}
            >
              <Check className={cn("h-4 w-4", activeTab === 'successful' ? "text-green-500" : "text-gray-400")} />
              Successful Syncs
            </button>
          </div>
          
          {activeTab === 'failed' && (
            <button
              onClick={handleRetry}
              disabled={retrying || loading || failedRecords.length === 0}
              className="h-10 px-4 rounded-xl bg-[#920793] hover:bg-[#800681] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {retrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Retry Failed Syncs
                </>
              )}
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-[13px] text-red-600 font-medium leading-normal">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3.5 py-3">
            <Check className="h-4 w-4 text-green-500 shrink-0" />
            <p className="text-[13px] text-green-600 font-medium leading-normal">{successMsg}</p>
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-[#920793] animate-spin" />
          </div>
        ) : activeTab === 'failed' ? (
          failedRecords.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Check className="h-12 w-12 text-green-400 mb-3" />
              <p className="text-[14px] font-bold text-gray-800">All Systems Synced</p>
              <p className="text-[13px] text-gray-500 mt-1 max-w-[300px]">
                There are currently no failed account or upgrade requests pending synchronization with Regent Core.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2 whitespace-nowrap">Date / Time</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Type</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Account / Tier</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Customer Name</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Officer</th>
                    <th className="pb-3 pl-2">Failure Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[13px] font-medium text-gray-800">
                  {failedRecords.map((record) => (
                    <tr key={record.resourceId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-2 text-gray-500 text-[12px] whitespace-nowrap">
                        {format(new Date(record.failedAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-block px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-600">
                          {record.resourceType.replace('_', ' ')}
                        </span>
                      </td>
                      {record.accountDetails ? (
                        <>
                          <td className="py-3 px-2 text-[12px] font-semibold text-gray-900 whitespace-nowrap">{record.accountDetails.primaryInfo}</td>
                          <td className="py-3 px-2 text-[12px] text-gray-600 whitespace-nowrap">{record.accountDetails.customerName}</td>
                          <td className="py-3 px-2 text-[12px] text-gray-500 whitespace-nowrap">{record.accountDetails.officerName}</td>
                        </>
                      ) : (
                        <td className="py-3 px-2" colSpan={3}>
                          <span className="font-mono text-gray-500 text-[11px]">{record.resourceId.slice(0, 8)}...{record.resourceId.slice(-4)}</span>
                        </td>
                      )}
                      <td className="py-3 pl-2 text-[12px] text-red-600 max-w-xs truncate" title={record.reason}>
                        {record.reason || 'Unknown failure'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          successfulRecords.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <Info className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-[14px] font-bold text-gray-800">No Successful Syncs</p>
              <p className="text-[13px] text-gray-500 mt-1 max-w-[300px]">
                No recent successful synchronization records found.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="pb-3 pr-2 whitespace-nowrap">Date / Time</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Type</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Account / Tier</th>
                    <th className="pb-3 px-2 whitespace-nowrap">Customer Name</th>
                    <th className="pb-3 pl-2 whitespace-nowrap">Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-[13px] font-medium text-gray-800">
                  {successfulRecords.map((record) => (
                    <tr key={record.resourceId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 pr-2 text-gray-500 text-[12px] whitespace-nowrap">
                        {format(new Date(record.syncedAt), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-3 px-2">
                        <span className="inline-block px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px] font-bold text-gray-600">
                          {record.resourceType.replace('_', ' ')}
                        </span>
                      </td>
                      {record.accountDetails ? (
                        <>
                          <td className="py-3 px-2 text-[12px] font-semibold text-gray-900 whitespace-nowrap">{record.accountDetails.primaryInfo}</td>
                          <td className="py-3 px-2 text-[12px] text-gray-600 whitespace-nowrap">{record.accountDetails.customerName}</td>
                          <td className="py-3 pl-2 text-[12px] text-gray-500 whitespace-nowrap">{record.accountDetails.officerName}</td>
                        </>
                      ) : (
                        <td className="py-3 pl-2" colSpan={3}>
                          <span className="font-mono text-gray-500 text-[11px]">{record.resourceId}</span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
