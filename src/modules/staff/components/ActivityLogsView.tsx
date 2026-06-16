'use client';

import { useState } from 'react';
import { useActivityLogs } from '../hooks/useStaff';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { Calendar, Filter, User, Tag, Info, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import type { ActivityLog } from '../types/staff.types';

export function ActivityLogsView() {
  const [page, setPage] = useState(1);
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [staffIdFilter, setStaffIdFilter] = useState('');

  const { data: logs = [], isLoading, error, refetch } = useActivityLogs({
    page,
    limit: 50,
    module: moduleFilter || undefined,
    action: actionFilter || undefined,
    staffId: staffIdFilter || undefined,
  });

  const columns: ColumnDef<ActivityLog>[] = [
    {
      key: 'staff',
      header: 'Staff Member',
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-[#920793]">
            {log.staffName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-[13px]">{log.staffName}</p>
            <p className="text-[10px] text-gray-400">ID: {log.staffId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'module',
      header: 'Module',
      render: (log) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-800">
          {log.module}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action / Operation',
      render: (log) => (
        <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
          {log.action}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Details',
      render: (log) => {
        if (!log.details) return <span className="text-gray-400 text-[12px]">-</span>;
        return (
          <div className="text-[11px] text-gray-600 max-w-[200px] truncate" title={JSON.stringify(log.details)}>
            {log.details.requestId && `Request: ${log.details.requestId}`}
            {!log.details.requestId && JSON.stringify(log.details)}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (log) => (
        <span className="text-[12px] text-gray-500">
          {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
        </span>
      ),
    },
  ];

  function renderCard(log: ActivityLog) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-3 text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[12px] font-bold text-gray-900">{log.staffName}</span>
          </div>
          <span className="text-[11px] text-gray-400">
            {format(new Date(log.createdAt), 'MMM dd, HH:mm')}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-medium rounded">
            {log.module}
          </span>
          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-mono rounded">
            {log.action}
          </span>
        </div>

        {log.details && (
          <div className="bg-gray-50 rounded-lg p-2 text-[11px] text-gray-600 flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 shrink-0 text-gray-400" />
            <span className="truncate">
              {log.details.requestId ? `Request ID: ${log.details.requestId}` : JSON.stringify(log.details)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/more"
            className="h-9 w-9 rounded-xl border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-[22px] font-black text-gray-900">Activity Log</h1>
            <p className="text-[14px] text-gray-500 mt-0.5">RM activity audit trails</p>
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-[13px] font-bold text-gray-900">
          <Filter className="h-4 w-4 text-[#920793]" />
          Filter Audit Trails
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Module
            </label>
            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent"
            >
              <option value="">All Modules</option>
              <option value="ACCOUNT_OPENING">Account Opening</option>
              <option value="IDENTITY_VERIFICATION">Identity Verification</option>
              <option value="COMPLIANCE">Compliance Workflow</option>
              <option value="REFERENCES">References</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Action Name
            </label>
            <input
              type="text"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. INITIATED_ACCOUNT_OPENING"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              Staff / RM ID
            </label>
            <input
              type="text"
              value={staffIdFilter}
              onChange={(e) => {
                setStaffIdFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by specific Staff UUID"
              className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-[13px] font-semibold text-red-600">Failed to load activity logs</p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-[12px] font-bold text-[#920793] hover:underline"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <DataView
          data={logs}
          columns={columns}
          renderCard={renderCard}
          keyExtractor={(log) => log.id}
          title={`${logs.length} ${logs.length === 1 ? 'Action' : 'Actions'} Logged`}
          emptyMessage="No activity logs match your filters."
          isLoading={isLoading}
          gridCols="grid-cols-1 md:grid-cols-2"
        />
      )}
    </div>
  );
}
