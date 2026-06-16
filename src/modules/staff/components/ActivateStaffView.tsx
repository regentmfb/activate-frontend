'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronLeft, ShieldCheck, Mail, Building, MapPin, Users } from 'lucide-react';
import { useActivateStaff } from '../hooks/useStaff';
import { cn } from '@src/utils';

export function ActivateStaffView() {
  const router = useRouter();
  const { data, isLoading, error } = useActivateStaff();
  const [activeTab, setActiveTab] = useState<'TL' | 'RM'>('TL');
  const [searchQuery, setSearchQuery] = useState('');

  const teamLeads = data?.teamLeads || [];
  const relationshipManagers = data?.relationshipManagers || [];

  const filteredTeamLeads = teamLeads.filter(tl => 
    tl.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tl.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tl.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tl.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRMs = relationshipManagers.filter(rm => 
    rm.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rm.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rm.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rm.branch || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentList = activeTab === 'TL' ? filteredTeamLeads : filteredRMs;

  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-36 animate-pulse space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-4 w-full bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#920793] hover:underline mb-2"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </button>
          <h1 className="text-[22px] font-black text-gray-900 flex items-center gap-2">
            Active Staff Directory <ShieldCheck className="h-6 w-6 text-emerald-500 shrink-0" />
          </h1>
          <p className="text-[14px] text-gray-500 mt-0.5">
            Overview of staff members who have active roles in Regent Activate
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setActiveTab('TL')}
          className={cn(
            "p-5 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden group",
            activeTab === 'TL' 
              ? "bg-white border-[#920793] shadow-md ring-1 ring-[#920793]/30" 
              : "bg-white border-gray-100 shadow-sm hover:border-gray-300"
          )}
        >
          <div className="flex justify-between items-start">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
              activeTab === 'TL' ? "bg-purple-50 text-[#920793]" : "bg-gray-50 text-gray-400"
            )}>
              <Users className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
              activeTab === 'TL' ? "bg-[#920793] text-white" : "bg-gray-100 text-gray-500"
            )}>
              Active Tab
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {isLoading ? '...' : teamLeads.length}
          </p>
          <p className="text-[12px] font-medium text-gray-500 mt-0.5">Team Leads</p>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 group-hover:scale-110 transition-transform">
            <Users className="h-24 w-24 text-purple-900" />
          </div>
        </button>

        <button 
          onClick={() => setActiveTab('RM')}
          className={cn(
            "p-5 rounded-2xl text-left border transition-all duration-300 relative overflow-hidden group",
            activeTab === 'RM' 
              ? "bg-white border-[#920793] shadow-md ring-1 ring-[#920793]/30" 
              : "bg-white border-gray-100 shadow-sm hover:border-gray-300"
          )}
        >
          <div className="flex justify-between items-start">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center mb-3 transition-colors",
              activeTab === 'RM' ? "bg-purple-50 text-[#920793]" : "bg-gray-50 text-gray-400"
            )}>
              <Users className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
              activeTab === 'RM' ? "bg-[#920793] text-white" : "bg-gray-100 text-gray-500"
            )}>
              Active Tab
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900">
            {isLoading ? '...' : relationshipManagers.length}
          </p>
          <p className="text-[12px] font-medium text-gray-500 mt-0.5">Relationship Managers</p>
          <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 group-hover:scale-110 transition-transform">
            <Users className="h-24 w-24 text-purple-900" />
          </div>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${activeTab === 'TL' ? 'Team Leads' : 'Relationship Managers'} by name, email or department...`}
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#920793] focus:border-transparent bg-white" 
        />
      </div>

      {/* Main Content */}
      {isLoading ? (
        renderSkeleton()
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-[13px] text-center">
          Failed to load staff list. Please try again.
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-gray-50 text-gray-500 p-8 rounded-2xl border border-gray-100 text-[13px] text-center">
          No {activeTab === 'TL' ? 'Team Leads' : 'Relationship Managers'} found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map((s) => {
            const initials = s.staffName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div 
                key={s.staffId} 
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-purple-200 transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner" 
                        style={{ backgroundColor: '#920793' }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold text-gray-900 truncate">
                          {s.staffName}
                        </p>
                        <span className={cn(
                          "text-[9px] font-extrabold px-2 py-0.5 rounded-full inline-block mt-0.5 uppercase tracking-wider",
                          activeTab === 'TL' ? "bg-purple-100 text-[#920793]" : "bg-blue-100 text-blue-800"
                        )}>
                          {activeTab === 'TL' ? 'Team Lead' : 'Relationship Manager'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4 space-y-2 border-t border-gray-50 pt-3">
                    {s.email && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Building className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>Department: <strong className="text-gray-700">{s.department || 'N/A'}</strong></span>
                    </div>
                    {s.branch && s.branch !== 'N/A' && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>Branch: <strong className="text-gray-700">{s.branch}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
