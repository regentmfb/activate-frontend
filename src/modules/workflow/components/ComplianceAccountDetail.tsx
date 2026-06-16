'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Shield, AlertTriangle,
  FileText, User, Calendar, ExternalLink, History,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { Badge } from '@/src/components/ui/badge';
import { Input } from '@/src/components/ui/input';
import { X } from 'lucide-react';
import { useComplianceAccountById, useUpdateComplianceAccount } from '../hooks/useWorkflow';
import { useMarkNonCompliantWithTask, useApproveComplianceWithTaskCompletion, useWorkflowTasksForAccount } from '../hooks/useWorkflowTaskIntegration';
import { usePlaceComplianceLien } from '../hooks/useWorkflow';
import { ACCOUNT_TYPE_LABELS } from '@/src/constants/labels';
import { cn } from '@/src/utils';
import type { ComplianceAccountDetail } from '../types/workflow.types';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SUBMITTED:        { label: 'Submitted',        icon: Clock,         color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
  PROCESSING:       { label: 'Processing',       icon: Clock,         color: 'text-blue-600',  bg: 'bg-blue-50 border-blue-200' },
  COMPLETED:        { label: 'Completed',        icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  PENDING:          { label: 'Pending Review',   icon: Clock,         color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
  COMPLETED_REVIEW: { label: 'Review Completed', icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  APPROVED:         { label: 'Approved',         icon: CheckCircle,   color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  REJECTED:         { label: 'Non-Compliant',    icon: XCircle,       color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
  NON_COMPLIANT:    { label: 'Non-Compliant',    icon: XCircle,       color: 'text-red-600',   bg: 'bg-red-50 border-red-200' },
  LIEN_PLACED:      { label: 'Lien Placed',      icon: AlertTriangle, color: 'text-orange-600',bg: 'bg-orange-50 border-orange-200' },
};

const DEFAULT_STATUS_CONFIG = { label: 'Unknown', icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children, action }: { title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-[#920793]" />}
          <p className="text-[14px] font-bold text-gray-900">{title}</p>
        </div>
        {action}
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

function NotProvided() {
  return <span className="text-gray-400 font-normal">Not provided</span>;
}

function TasksSummary({ accountId }: { accountId: string }) {
  const { tasks, hasActiveTasks, completedTasksCount } = useWorkflowTasksForAccount(accountId);
  if (tasks.length === 0) {
    return <p className="text-[12px] text-gray-400 py-3 text-center">No related tasks found</p>;
  }
  return (
    <div className="space-y-2 py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] text-gray-500">{completedTasksCount} completed</span>
        {hasActiveTasks && <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 text-[10px]">Active</Badge>}
      </div>
      {tasks.slice(0, 3).map((task) => (
        <div key={task.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-gray-900 truncate">{task.title}</p>
            <p className="text-[10px] text-gray-500">{task.taskType}</p>
          </div>
          <Badge variant="outline" className={cn(
            'text-[10px]',
            task.status === 'COMPLETED' && 'bg-green-50 text-green-600 border-green-200',
            task.status === 'PENDING' && 'bg-amber-50 text-amber-600 border-amber-200',
          )}>
            {task.status}
          </Badge>
        </div>
      ))}
      {tasks.length > 3 && <p className="text-[11px] text-gray-400 text-center">+{tasks.length - 3} more</p>}
    </div>
  );
}

type Props = { id: string };

export function ComplianceAccountDetail({ id }: Props) {
  const router = useRouter();
  const { data, isLoading } = useComplianceAccountById(id);
  const { mutate: approveReview, isPending: isApproving } = useApproveComplianceWithTaskCompletion();
  const { mutate: markNonCompliant, isPending: isRejecting } = useMarkNonCompliantWithTask();
  const { mutate: placeLien, isPending: isPlacingLien } = usePlaceComplianceLien();
  const { mutate: updateAccount, isPending: isUpdating } = useUpdateComplianceAccount();

  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [lienAmount, setLienAmount] = useState('');
  const [lienReason, setLienReason] = useState('');
  const [showLienForm, setShowLienForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '', middleName: '', lastName: '', gender: '',
    dateOfBirth: '', phoneNumber: '', email: '', address: '', bvn: '', nin: '',
  });

  const backButton = (
    <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
      <ArrowLeft className="h-3.5 w-3.5" /> Back
    </button>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {backButton}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Loading compliance review...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        {backButton}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Compliance review not found.</p>
        </div>
      </div>
    );
  }

  const { request, rm, customer, verification, documents, reviewHistory } = data as ComplianceAccountDetail;

  const config = STATUS_CONFIG[request.status] ?? {
    ...DEFAULT_STATUS_CONFIG,
    label: request.status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? 'Unknown',
  };
  const StatusIcon = config.icon;
  const accountTypeLabel = ACCOUNT_TYPE_LABELS[`${request.accountCategory}_${request.accountType}`]
    || `${request.accountCategory} ${request.accountType}`;

  const canAct = request.status === 'PENDING';

  const handleApprove = () => approveReview({ id: request.id, comments: comments.trim() || undefined });

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    markNonCompliant({ id: request.id, payload: { reason: rejectionReason.trim() } });
    setShowRejectionForm(false);
    setRejectionReason('');
  };

  const handlePlaceLien = () => {
    if (!lienAmount.trim() || !lienReason.trim()) return;
    placeLien({
      id: request.id,
      payload: {
        accountNumber: request.bankOneAccountNumber || request.id,
        amount: parseFloat(lienAmount),
        reason: lienReason.trim(),
        requestId: request.id,
      },
    });
    setShowLienForm(false);
    setLienAmount('');
    setLienReason('');
  };

  return (
    <div className="space-y-4">
      {backButton}

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#920793' }}>
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-black text-gray-900">{request.requestNumber}</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">{accountTypeLabel}</p>
            {customer && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <User className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-800">{customer.fullName}</span>
                <span className="text-[12px] text-gray-500">· {customer.phoneNumber}</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className={cn('shrink-0', config.bg, config.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>
      </div>

      {/* Failure reason */}
      {request.failureReason && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-800">Non-Compliance / Failure Reason</p>
            <p className="text-[12px] text-red-700 mt-0.5">{request.failureReason}</p>
          </div>
        </div>
      )}

      {/* Request details */}
      <Section title="Account Request" icon={FileText}>
        <InfoRow label="Request Number" value={<span className="font-mono text-[12px]">{request.requestNumber}</span>} />
        <InfoRow label="Account Type" value={accountTypeLabel} />
        <InfoRow label="Tier" value={request.tier?.replace('TIER_', 'Tier ') ?? 'N/A'} />
        <InfoRow label="Verification Mode" value={request.verificationMode ?? 'N/A'} />
        <InfoRow label="Branch" value={request.branchName ?? 'N/A'} />
        <InfoRow label="Department" value={request.departmentName ?? 'N/A'} />
        {request.bankOneAccountNumber && (
          <InfoRow label="Account Number" value={<span className="font-mono">{request.bankOneAccountNumber}</span>} />
        )}
        <InfoRow label="Retry Count" value={String(request.retryCount)} />
        <InfoRow label="RM" value={
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-gray-400" />
            {rm?.staffName ?? '—'}
          </span>
        } />
        <InfoRow label="Submitted" value={
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            {new Date(request.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        } />
      </Section>

      {/* Customer Biodata */}
      <Section
        title="Customer Biodata & KYC"
        icon={User}
        action={
          canAct && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditForm({
                  firstName: customer?.fullName?.split(' ')[0] ?? '',
                  middleName: '',
                  lastName: customer?.fullName?.split(' ').slice(-1)[0] ?? '',
                  gender: customer?.gender ?? '',
                  dateOfBirth: customer?.dateOfBirth ?? '',
                  phoneNumber: customer?.phoneNumber ?? '',
                  email: customer?.email ?? '',
                  address: customer?.address ?? '',
                  bvn: '',
                  nin: '',
                });
                setShowEditForm(true);
              }}
              className="text-[#920793] border-purple-200 hover:bg-purple-50"
            >
              Edit Details
            </Button>
          )
        }
      >
        <InfoRow label="Full Name" value={customer?.fullName ?? <NotProvided />} />
        <InfoRow label="Gender" value={customer?.gender && customer.gender !== 'N/A' ? customer.gender : <NotProvided />} />
        <InfoRow label="Date of Birth" value={customer?.dateOfBirth && customer.dateOfBirth !== 'N/A' ? customer.dateOfBirth : <NotProvided />} />
        <InfoRow label="Phone Number" value={customer?.phoneNumber && customer.phoneNumber !== 'N/A' ? customer.phoneNumber : <NotProvided />} />
        <InfoRow label="Email" value={customer?.email && customer.email !== 'N/A' ? customer.email : <NotProvided />} />
        <InfoRow label="Address" value={customer?.address && customer.address !== 'N/A' ? customer.address : <NotProvided />} />
      </Section>

      {/* Identity Verification */}
      {verification && (
        <Section title="Identity Verification" icon={Shield}>
          <InfoRow label="Verification Type" value={verification.type} />
          <InfoRow label="Status" value={
            <span className={cn('font-semibold', verification.status === 'COMPLETED' ? 'text-green-600' : 'text-amber-600')}>
              {verification.status.replace(/_/g, ' ')}
            </span>
          } />
          {verification.matchScore != null && (
            <InfoRow label="Match Score" value={`${verification.matchScore}%`} />
          )}
          {verification.livenessCheckPassed != null && (
            <InfoRow label="Liveness Check" value={
              <span className={cn('font-semibold', verification.livenessCheckPassed ? 'text-green-600' : 'text-red-600')}>
                {verification.livenessCheckPassed ? `Passed (${verification.livenessScore?.toFixed(2)})` : 'Failed'}
              </span>
            } />
          )}
          {verification.bvnMasked && (
            <InfoRow label="BVN" value={<span className="font-mono">{verification.bvnMasked}</span>} />
          )}
          {verification.ninMasked && (
            <InfoRow label="NIN" value={<span className="font-mono">{verification.ninMasked}</span>} />
          )}
        </Section>
      )}

      {/* Documents */}
      {documents.length > 0 && (
        <Section title={`Documents (${documents.length})`} icon={FileText}>
          <div className="py-2 space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-[12px] font-semibold text-gray-900">{doc.documentType.replace(/_/g, ' ')}</p>
                  <p className="text-[11px] text-gray-500">{doc.fileName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn(
                    'text-[10px]',
                    doc.status === 'VERIFIED' && 'bg-green-50 text-green-700 border-green-200',
                    doc.status === 'PENDING' && 'bg-amber-50 text-amber-700 border-amber-200',
                    doc.status === 'REJECTED' && 'bg-red-50 text-red-700 border-red-200',
                  )}>
                    {doc.status}
                  </Badge>
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[#920793]">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Review History */}
      {reviewHistory.length > 0 && (
        <Section title="Review History" icon={History}>
          <div className="py-2 space-y-3">
            {reviewHistory.map((review, i) => (
              <div key={i} className={cn(
                'p-3 rounded-xl border',
                review.action === 'APPROVED' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn('text-[12px] font-bold', review.action === 'APPROVED' ? 'text-green-700' : 'text-red-700')}>
                    {review.action} by {review.reviewerName}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {new Date(review.reviewedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                {review.comments && <p className="text-[12px] text-gray-700">{review.comments}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Related Tasks */}
      <Section title="Related Tasks">
        <TasksSummary accountId={request.id} />
      </Section>

      {/* Compliance Actions */}
      {canAct && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <p className="text-[14px] font-bold text-gray-900">Compliance Actions</p>

          <div className="space-y-2">
            <label className="text-[12px] font-medium text-gray-700">Comments (optional)</label>
            <Textarea
              placeholder="Add comments about this compliance review..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleApprove} disabled={isApproving} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              {isApproving ? 'Approving...' : 'Approve Review'}
            </Button>

            <Button onClick={() => setShowRejectionForm(!showRejectionForm)} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="h-4 w-4 mr-2" />
              Mark Non-Compliant
            </Button>

            <Button onClick={() => setShowLienForm(!showLienForm)} variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
              <Shield className="h-4 w-4 mr-2" />
              Place Lien
            </Button>
          </div>

          {showRejectionForm && (
            <div className="space-y-3 p-4 bg-red-50 rounded-lg border border-red-100">
              <label className="text-[12px] font-medium text-red-800">Reason for Non-Compliance *</label>
              <Textarea
                placeholder="Explain why this account is non-compliant..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleReject} disabled={!rejectionReason.trim() || isRejecting} size="sm" className="bg-red-600 hover:bg-red-700">
                  {isRejecting ? 'Processing...' : 'Submit'}
                </Button>
                <Button onClick={() => { setShowRejectionForm(false); setRejectionReason(''); }} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showLienForm && (
            <div className="space-y-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-amber-800">Lien Amount *</label>
                  <input type="number" placeholder="0.00" value={lienAmount} onChange={(e) => setLienAmount(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-amber-800">Reason *</label>
                  <input type="text" placeholder="Reason for lien..." value={lienReason} onChange={(e) => setLienReason(e.target.value)} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePlaceLien} disabled={!lienAmount.trim() || !lienReason.trim() || isPlacingLien} size="sm" className="bg-amber-600 hover:bg-amber-700">
                  {isPlacingLien ? 'Placing...' : 'Place Lien (PIN Required)'}
                </Button>
                <Button onClick={() => { setShowLienForm(false); setLienAmount(''); setLienReason(''); }} variant="outline" size="sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto my-8">
            <button onClick={() => setShowEditForm(false)} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-[16px] font-black text-gray-900 mb-4">Edit Customer Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['firstName', 'middleName', 'lastName', 'phoneNumber', 'email', 'address'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                    {field.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <Input value={editForm[field]} onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })} />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Gender</label>
                <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-[13px]">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Birth</label>
                <Input type="date" value={editForm.dateOfBirth} onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">BVN (11 digits)</label>
                <Input value={editForm.bvn} maxLength={11} onChange={(e) => setEditForm({ ...editForm, bvn: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">NIN (11 digits)</label>
                <Input value={editForm.nin} maxLength={11} onChange={(e) => setEditForm({ ...editForm, nin: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Button onClick={() => setShowEditForm(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button
                onClick={() => updateAccount({ id: request.id, payload: editForm }, { onSuccess: () => setShowEditForm(false) })}
                disabled={isUpdating}
                className="flex-1 bg-[#920793] hover:bg-[#7a067b]"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}