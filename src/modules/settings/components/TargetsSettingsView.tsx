'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Target, Users, Calendar, BarChart3, Plus, Loader2, Sparkles, Check, AlertCircle } from 'lucide-react';
import { staffApi } from '@/src/modules/staff/api/staff.api';
import { targetsApi, PeriodType, StaffTarget } from '@/src/modules/targets/api/targets.api';
import { cn } from '@src/utils';

export function TargetsSettingsView() {
  const router = useRouter();

  const [staffList, setStaffList] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  
  // Targets lists
  const [targetsList, setTargetsList] = useState<StaffTarget[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);

  // Form state
  const [year, setYear] = useState(new Date().getFullYear());
  const [periodType, setPeriodType] = useState<PeriodType>('MONTHLY');
  const [periodValue, setPeriodValue] = useState(new Date().getMonth() + 1);
  const [accounts, setAccounts] = useState('');
  const [mobile, setMobile] = useState('');
  const [deposits, setDeposits] = useState('');

  // Submit / Notification status
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch all staff members
  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await staffApi.getActivateStaff();
        // Combine both RMs and Team Leads, prepending wildcard options
        const allStaff = [
          { staffId: 'ALL_RM', staffName: 'All Relationship Managers (RMs)', roleLabel: 'RM', firstName: 'All', lastName: 'RMs' },
          { staffId: 'ALL_TEAM_LEAD', staffName: 'All Team Leads (TLs)', roleLabel: 'Team Lead', firstName: 'All', lastName: 'TLs' },
          ...(res.relationshipManagers || []).map((s) => ({ ...s, roleLabel: 'RM' })),
          ...(res.teamLeads || []).map((s) => ({ ...s, roleLabel: 'Team Lead' })),
        ];
        setStaffList(allStaff);
        if (allStaff.length > 0) {
          setSelectedStaffId(allStaff[0].staffId || allStaff[0].id);
        }
      } catch (err) {
        console.error('Failed to load staff list:', err);
      } finally {
        setLoadingStaff(false);
      }
    }
    loadStaff();
  }, []);

  // Fetch targets when selected staff changes
  useEffect(() => {
    if (!selectedStaffId) return;

    async function loadTargets() {
      setLoadingTargets(true);
      try {
        const list = await targetsApi.getTargetsByStaff(selectedStaffId);
        setTargetsList(list);
      } catch (err) {
        console.error('Failed to load targets:', err);
      } finally {
        setLoadingTargets(false);
      }
    }
    loadTargets();
  }, [selectedStaffId]);

  // Adjust period value default when type changes
  useEffect(() => {
    if (periodType === 'YEARLY') {
      setPeriodValue(0);
    } else if (periodType === 'QUARTERLY') {
      setPeriodValue(1);
    } else if (periodType === 'MONTHLY') {
      setPeriodValue(new Date().getMonth() + 1);
    }
  }, [periodType]);

  const selectedStaffObj = staffList.find((s) => (s.staffId || s.id) === selectedStaffId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStaffId || !selectedStaffObj) return;

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        staffId: selectedStaffId,
        staffName: selectedStaffObj.staffName || '',
        role: selectedStaffObj.roleLabel === 'RM' ? 'RELATIONSHIP_MANAGER' : 'TEAM_LEAD',
        year: Number(year),
        periodType,
        periodValue: Number(periodValue),
        accounts: accounts ? Number(accounts) : 0,
        mobile: mobile ? Number(mobile) : 0,
        deposits: deposits ? Number(deposits) : 0,
      };

      await targetsApi.setTarget(payload);
      setSuccessMsg('Target successfully configured!');
      
      // Reload targets
      const updatedTargets = await targetsApi.getTargetsByStaff(selectedStaffId);
      setTargetsList(updatedTargets);

      // Reset input fields
      setAccounts('');
      setMobile('');
      setDeposits('');

      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save target.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-black text-gray-900 flex items-center gap-2">
          <Target className="h-6 w-6 text-[#920793]" />
          Targets Configuration
        </h1>
        <p className="text-[14px] text-gray-500 mt-0.5">
          Configure yearly, quarterly, and monthly performance targets for RMs and Team Leads.
        </p>
      </div>

      {loadingStaff ? (
        <div className="h-48 flex items-center justify-center bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="h-6 w-6 text-[#920793] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#920793]" />
                Set Performance Target
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Staff Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Staff Member</label>
                  <div className="relative">
                    <select
                      value={selectedStaffId}
                      onChange={(e) => setSelectedStaffId(e.target.value)}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 outline-none focus:border-[#920793] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {staffList.map((s) => (
                        <option key={s.staffId || s.id} value={s.staffId || s.id}>
                          {s.staffName || `${s.firstName} ${s.lastName}`} ({s.roleLabel})
                        </option>
                      ))}
                    </select>
                    <Users className="absolute right-3.5 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Period Configuration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Year</label>
                    <select
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 outline-none focus:border-[#920793] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Period Type</label>
                    <select
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 outline-none focus:border-[#920793] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                    </select>
                  </div>
                </div>

                {/* Period Value Selection */}
                {periodType !== 'YEARLY' && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                      {periodType === 'MONTHLY' ? 'Month' : 'Quarter'}
                    </label>
                    <select
                      value={periodValue}
                      onChange={(e) => setPeriodValue(Number(e.target.value))}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 outline-none focus:border-[#920793] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {periodType === 'MONTHLY'
                        ? months.map((m, idx) => (
                            <option key={m} value={idx + 1}>
                              {m}
                            </option>
                          ))
                        : [1, 2, 3, 4].map((q) => (
                            <option key={q} value={q}>
                              Quarter {q}
                            </option>
                          ))}
                    </select>
                  </div>
                )}

                {/* Target values */}
                <div className="space-y-3 pt-2 border-t border-gray-50">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Accounts Opened Target</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 15"
                      value={accounts}
                      onChange={(e) => setAccounts(e.target.value)}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#920793] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Mobile App Onboard Target</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 10"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#920793] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Deposit Volume Target (₦)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000000"
                      value={deposits}
                      onChange={(e) => setDeposits(e.target.value)}
                      className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-medium text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#920793] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-3.5 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                    <p className="text-[12px] text-red-600 font-medium leading-normal">{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-100 px-3.5 py-3">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <p className="text-[12px] text-green-600 font-medium leading-normal">{successMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 rounded-xl bg-[#920793] hover:bg-[#800681] text-white text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving Target...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Save Target Configuration
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Targets List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-full flex flex-col min-h-[480px]">
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-4 border-b border-gray-50">
                <BarChart3 className="h-4 w-4 text-[#920793]" />
                Configured Targets
              </h2>

              {loadingTargets ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-[#920793] animate-spin" />
                </div>
              ) : targetsList.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <Target className="h-10 w-10 text-gray-200 mb-2" />
                  <p className="text-[13px] font-semibold">No configured targets found</p>
                  <p className="text-[12px] text-gray-400 mt-1 max-w-[280px]">
                    Use the form on the left to set performance targets for this staff member.
                  </p>
                </div>
              ) : (
                <div className="flex-1 overflow-x-auto mt-4">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 pr-2">Period</th>
                        <th className="pb-3 px-2">Accounts</th>
                        <th className="pb-3 px-2">Mobile</th>
                        <th className="pb-3 px-2">Deposits</th>
                        <th className="pb-3 pl-2">Set By</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-[13px] font-medium text-gray-800">
                      {targetsList.map((target) => {
                        let periodLabel = `${target.year} - `;
                        if (target.periodType === 'MONTHLY') {
                          periodLabel += months[target.periodValue - 1];
                        } else if (target.periodType === 'QUARTERLY') {
                          periodLabel += `Q${target.periodValue}`;
                        } else {
                          periodLabel += 'Yearly';
                        }

                        return (
                          <tr key={target.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 pr-2 font-bold text-gray-900">{periodLabel}</td>
                            <td className="py-3 px-2">{target.accounts}</td>
                            <td className="py-3 px-2">{target.mobile}</td>
                            <td className="py-3 px-2">₦{Number(target.deposits).toLocaleString()}</td>
                            <td className="py-3 pl-2 text-gray-400 text-[12px]">
                              {target.setByName}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
