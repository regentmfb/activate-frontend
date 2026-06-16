'use client';

import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Users, FolderOpen, Smartphone, Wallet } from 'lucide-react';
import { useStaff } from '../hooks/useStaff';
import { useAuthStore } from '@src/store/auth.store';
import { StaffMember } from '../types/staff.types';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { ROLE_LABELS, ROLE_COLORS } from '@src/constants/labels';
import { cn } from '@src/utils';

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', ROLE_COLORS[role] ?? 'bg-gray-100 text-gray-500')}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

export function StaffList() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { staff, allStaff, search, setSearch } = useStaff();

  const role = user?.hrmsRoles?.[0] ?? user?.roles?.[0]?.name;
  const title = role === 'TEAM_LEAD' ? 'My Team' : role === 'CMO' ? 'My Directorate' : 'All Staff';
  const subtitle = role === 'TEAM_LEAD'
    ? `${allStaff.length} RMs in your team`
    : role === 'CMO'
    ? `${allStaff.filter((s) => s.role === 'TEAM_LEAD').length} Team Leads · ${allStaff.filter((s) => s.role === 'RM').length} RMs`
    : `${allStaff.length} staff members`;

  // Summary stats
  const totalAccounts = allStaff.reduce((s, m) => s + (m.accountsOpened ?? 0), 0);
  const totalMobile = allStaff.reduce((s, m) => s + (m.mobileOnboarded ?? 0), 0);
  const totalDeposits = allStaff.reduce((s, m) => s + (m.depositCount ?? 0), 0);

  const columns: ColumnDef<StaffMember>[] = [
    {
      key: 'name', header: 'Staff Member',
      render: (s) => {
        const initials = s.staffName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>{initials}</div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 whitespace-nowrap">{s.staffName}</p>
              {s.email && <p className="text-[11px] text-gray-400 truncate">{s.email}</p>}
            </div>
          </div>
        );
      },
    },
    { key: 'role',     header: 'Role',     render: (s) => <RoleBadge role={s.role ?? ''} /> },
    { key: 'accounts', header: 'Accounts', render: (s) => <span className="font-semibold text-gray-900">{s.accountsOpened}</span> },
    { key: 'mobile',   header: 'Mobile',   render: (s) => <span className="text-gray-600">{s.mobileOnboarded}</span> },
    { key: 'deposits', header: 'Deposits', render: (s) => <span className="text-gray-600">{s.depositCount}</span> },
    {
      key: 'action', header: '',
      render: (s) => (
        <button onClick={() => router.push(`/staff/${s.staffId}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors whitespace-nowrap">
          View <ChevronRight className="h-3.5 w-3.5" />
        </button>
      ),
    },
  ];

  function renderCard(s: StaffMember) {
    const initials = s.staffName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    return (
      <button onClick={() => router.push(`/staff/${s.staffId}`)}
        className="w-full bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-shadow active:scale-[0.98] text-left">
        <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ backgroundColor: '#920793' }}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-semibold text-gray-900">{s.staffName}</p>
            <RoleBadge role={s.role ?? ''} />
          </div>
          {s.teamLeadName && s.role === 'RM' && (
            <p className="text-[11px] text-gray-400 mt-0.5">Team Lead: {s.teamLeadName}</p>
          )}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <FolderOpen className="h-3 w-3" /> {s.accountsOpened} accounts
            </span>
            <span className="flex items-center gap-1 text-[11px] text-gray-500">
              <Smartphone className="h-3 w-3" /> {s.mobileOnboarded} mobile
            </span>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[22px] font-black text-gray-900">{title}</h1>
          <p className="text-[14px] text-gray-500 mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => router.push('/staff/active')}
          className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl text-xs font-bold text-white bg-[#920793] hover:bg-[#720573] transition-all shadow-sm active:scale-[0.98] shrink-0"
        >
          <Users className="h-4 w-4" /> View Active Roles
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center mb-2">
            <FolderOpen className="h-4 w-4 text-[#920793]" />
          </div>
          <p className="text-2xl font-black text-gray-900">{totalAccounts}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Total Accounts</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center mb-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{totalMobile}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">Mobile Active</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-green-50 flex items-center justify-center mb-2">
            <Wallet className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-black text-gray-900">{totalDeposits}</p>
          <p className="text-[12px] text-gray-500 mt-0.5">With Deposit</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or role..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent" />
      </div>

      <DataView
        data={staff}
        columns={columns}
        renderCard={renderCard}
        keyExtractor={(s) => s.staffId ?? ''}
        title={`${staff.length} ${staff.length === 1 ? 'Member' : 'Members'}`}
        emptyMessage="No staff members found."
        gridCols="grid-cols-1 sm:grid-cols-2"
      />
    </div>
  );
}
