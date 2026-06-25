'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, ArrowRight, Clock, CheckCircle2, AlertCircle,
  RefreshCw, Smartphone, User, Calendar, UserCheck, Play, AlertTriangle, XCircle, FileText, UploadCloud, Edit3, ShieldAlert
} from 'lucide-react';
import { cn } from '@src/utils';
import { TaskStatus } from '../types/tasks.types';
import { ACCOUNT_TYPE_LABELS } from '@src/constants/labels';
import { 
  useTaskById, 
  useCompleteTask, 
  useCancelTask,
} from '../hooks/useTaskBank';
import { Button } from '@src/components/ui/button';
import { Badge } from '@src/components/ui/badge';
import { useLatestLocationVerificationByRequest, useSubmitLocationManualReview } from '@src/modules/account-opening/hooks/useLocationVerification';
import { useUpdateComplianceAccount } from '@src/modules/workflow/hooks/useWorkflow';
import { useRetryAccountRequest } from '@src/modules/account-opening/hooks/useAccountOpening';
import { documentsApi } from '@src/modules/documents/api/documents.api';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { appToast } from '@src/lib/toast';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ElementType; color: string; bg: string; description: string }> = {
  PENDING_ACTION:        { label: 'Pending Action',        icon: Clock,         color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',   description: 'Task requires action from the assigned staff member.' },
  PENDING_UPLOAD:        { label: 'Pending Upload',        icon: RefreshCw,     color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',     description: 'Task is waiting for document or photo upload.' },
  PENDING_VERIFICATION:  { label: 'Pending Verification',  icon: UserCheck,     color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', description: 'Task is awaiting identity or document verification.' },
  PENDING_REVIEW:        { label: 'Pending Review',        icon: Play,          color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-200', description: 'Task is pending review by operations or compliance.' },
  FAILED_RETRYABLE:      { label: 'Failed (Retryable)',    icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', description: 'Task failed but can be retried by the staff member.' },
  FAILED_MANUAL_REVIEW:  { label: 'Failed (Manual Review)',icon: AlertCircle,   color: 'text-red-600',    bg: 'bg-red-50 border-red-200',       description: 'Task failed and requires manual review by operations.' },
  COMPLETED:             { label: 'Completed',             icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50 border-green-200',   description: 'Task has been completed successfully.' },
  CANCELLED:             { label: 'Cancelled',             icon: AlertCircle,   color: 'text-gray-600',   bg: 'bg-gray-50 border-gray-200',     description: 'Task has been cancelled and will not be completed.' },
};

function getContinueRoute(task: { taskType?: string; requestId?: string; activateRequestId?: string; accountNumber?: string; customerId?: string }) {
  const requestId = task.requestId || task.activateRequestId;
  
  switch (task.taskType) {
    case 'TIER_2_PENDING':
    case 'TIER_2_UPGRADE_PENDING':
    case 'TIER_3_PENDING':
    case 'TIER_3_UPGRADE_PENDING':
      return requestId ? `/account-upgrade/${requestId}` : null;
    case 'PICTURE_UPLOAD_PENDING':
    case 'REFERENCE_FAILED':
    case 'REFERENCE_RESUBMISSION':
    case 'FAILED_VERIFICATION':
    case 'VERIFICATION_FAILED':
    case 'CORRECTION_REQUESTED':
    case 'REJECTED_ACCOUNT_CORRECTION':
    case 'MIDDLEWARE_FAILED':
      return requestId ? `/account-opening/${requestId}` : null;
    case 'MOBILE_ONBOARDING_PENDING':
    case 'CUSTOMER_MOBILE_ONBOARDING_PENDING':
      return task.customerId ? `/customers/${task.customerId}` : null;
    default:
      return null;
  }
}

function getContinueLabel(taskType?: string): string {
  switch (taskType) {
    case 'TIER_2_PENDING':
    case 'TIER_2_UPGRADE_PENDING':    return 'Start Tier 2 Upgrade';
    case 'TIER_3_PENDING':
    case 'TIER_3_UPGRADE_PENDING':    return 'Start Tier 3 Upgrade';
    case 'PICTURE_UPLOAD_PENDING':    return 'Upload Customer Photo';
    case 'REFERENCE_FAILED':
    case 'REFERENCE_RESUBMISSION':    return 'Re-upload Reference Form';
    case 'FAILED_VERIFICATION':
    case 'VERIFICATION_FAILED':       return 'Retry Verification';
    case 'CORRECTION_REQUESTED':
    case 'REJECTED_ACCOUNT_CORRECTION': return 'Review & Correct';
    case 'MOBILE_ONBOARDING_PENDING':
    case 'CUSTOMER_MOBILE_ONBOARDING_PENDING': return 'View Customer Profile';
    case 'MIDDLEWARE_FAILED':         return 'Retry Action';
    default:                          return 'Continue';
  }
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-[12px] text-gray-500 font-medium">{label}</span>
      <span className="text-[13px] font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}

function TaskActions({ 
  task, 
  onComplete, 
  onCancel
}: {
  task: any;
  onComplete: () => void;
  onCancel: () => void;
}) {
  const canComplete = task.status !== 'COMPLETED' && task.status !== 'CANCELLED';
  const canCancel = task.status !== 'COMPLETED' && task.status !== 'CANCELLED';

  return (
    <div className="flex flex-wrap gap-2">
      {canComplete && (
        <Button onClick={onComplete} size="sm" variant="default" className="bg-[#920793] hover:bg-[#720573]">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          Complete
        </Button>
      )}
      
      {canCancel && (
        <Button onClick={onCancel} size="sm" variant="outline">
          <AlertCircle className="h-4 w-4 mr-1" />
          Cancel
        </Button>
      )}
    </div>
  );
}

type Props = { id: string };

export function TaskDetail({ id }: Props) {
  const router = useRouter();
  const { task, isLoading } = useTaskById(id);
  const { mutate: completeTask } = useCompleteTask();
  const { mutate: cancelTask } = useCancelTask();
  const [reviewNote, setReviewNote] = useState('');
  const { requirePin } = usePinVerification();
  const requestId = task?.activateRequestId || task?.requestId || '';
  
  const isManualLocationReview = task?.taskType === 'MANUAL_REVIEW_REQUIRED' || task?.taskType === 'MANUAL_REVIEW_PENDING';
  const isPictureUploadTask = task?.taskType === 'PICTURE_UPLOAD_PENDING';
  const isReferenceUploadTask = task?.taskType === 'REFERENCE_FAILED' || task?.taskType === 'REFERENCE_RESUBMISSION';
  const isCorrectionTask = task?.taskType === 'REJECTED_ACCOUNT_CORRECTION' || task?.taskType === 'CORRECTION_REQUESTED';
  const isOnboardingTask = task?.taskType === 'MOBILE_ONBOARDING_PENDING' || task?.taskType === 'CUSTOMER_MOBILE_ONBOARDING_PENDING';

  // Address Review States
  const { data: locationVerification, isLoading: isVerLoading } = useLatestLocationVerificationByRequest(
    isManualLocationReview ? requestId : ''
  );
  const proofDocId = (locationVerification?.proofOfAddressDocumentId || locationVerification?.customerLocationImageId) as string | undefined;
  const { data: docMetadata } = useQuery({
    queryKey: ['documents', proofDocId],
    queryFn: () => documentsApi.getDocumentById(proofDocId!),
    enabled: !!proofDocId,
  });
  const { mutate: submitLocationReview, isPending: isReviewing } = useSubmitLocationManualReview();

  // Document Upload States
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Correction Form States
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
  });

  const { mutate: updateAccountDetails, isPending: isSavingCorrection } = useUpdateComplianceAccount();
  const { mutate: retryAccountOpening, isPending: isRetryingOpening } = useRetryAccountRequest();

  // Initialize Correction Form
  useEffect(() => {
    if (task?.customer) {
      setEditForm({
        firstName: task.customer.firstName || '',
        lastName: task.customer.lastName || '',
        email: task.customer.email || '',
        phoneNumber: task.customer.phoneNumber || '',
        address: task.customer.address || '',
        dateOfBirth: task.customer.dateOfBirth ? new Date(task.customer.dateOfBirth).toISOString().split('T')[0] : '',
      });
    }
  }, [task]);

  function handleLocationApprove() {
    if (!locationVerification) return;
    requirePin('APPROVE_WORKFLOW', () => {
      submitLocationReview(
        { id: locationVerification.id, payload: { status: 'APPROVED', reason: reviewNote } },
        {
          onSuccess: () => {
            appToast.success('Location verification approved successfully.');
            completeTask(id);
          },
        }
      );
    });
  }

  function handleLocationReject() {
    if (!locationVerification) return;
    if (!reviewNote.trim()) {
      appToast.error('Please enter a rejection reason.');
      return;
    }
    requirePin('REJECT_WORKFLOW', () => {
      submitLocationReview(
        { id: locationVerification.id, payload: { status: 'REJECTED', reason: reviewNote } },
        {
          onSuccess: () => {
            appToast.success('Location verification marked as rejected.');
            completeTask(id);
          },
        }
      );
    });
  }

  // Handle Missing Document Uploads (Customer Photo / Reference Form)
  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const docType = isPictureUploadTask ? 'CUSTOMER_PHOTO' : 'REFERENCE_FORM';

    setUploadingFile(true);
    setUploadProgress(10);
    try {
      await documentsApi.upload({
        file,
        activateRequestId: requestId,
        documentType: docType,
        customerId: task?.customerId,
      }, (prog) => {
        setUploadProgress(prog);
      });
      appToast.success('Document uploaded successfully.');
      completeTask(id);
    } catch (err: any) {
      appToast.error(err.message || 'Failed to upload document.');
    } finally {
      setUploadingFile(false);
      setUploadProgress(0);
    }
  }

  // Handle Correction Form Submission
  function handleCorrectionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestId) return;

    updateAccountDetails(
      { id: requestId, payload: editForm },
      {
        onSuccess: () => {
          retryAccountOpening(requestId, {
            onSuccess: () => {
              completeTask(id);
              appToast.success('Corrections submitted and account retry triggered.');
            }
          });
        }
      }
    );
  }

  // Handle Mobile Onboarding Trigger
  function handleTriggerOnboarding() {
    requirePin('APPROVE_WORKFLOW', () => {
      completeTask(id);
      appToast.success('Mobile onboarding SMS and email credentials dispatched successfully.');
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-[14px] text-gray-400">Task not found.</p>
        </div>
      </div>
    );
  }

  const config = STATUS_CONFIG[task.status] || {
    label: task.status,
    icon: Clock,
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    description: 'Task status information not available.'
  };
  const StatusIcon = config.icon;
  const continueRoute = getContinueRoute(task);
  const continueLabel = getContinueLabel(task.taskType);
  const initials = (task.title || task.customerName || 'Task').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ backgroundColor: '#920793' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[18px] font-black text-gray-900">{task.title || task.customerName || 'Task'}</h1>
            {task.description && (
              <p className="text-[13px] text-gray-600 mt-0.5">{task.description}</p>
            )}
            <p className="text-[13px] text-gray-500 mt-0.5">
              {task.accountType && ACCOUNT_TYPE_LABELS[task.accountType] ? ACCOUNT_TYPE_LABELS[task.accountType] : 'Task'}
              {task.accountNumber && ` · ${task.accountNumber}`}
            </p>
            <p className="text-[11px] font-mono text-gray-400 mt-1">{task.requestId || task.activateRequestId || task.id}</p>
          </div>
          <Badge variant="outline" className="shrink-0">
            {task.priority}
          </Badge>
        </div>
      </div>

      {/* Status banner */}
      <div className={cn('rounded-2xl border p-4 flex items-start gap-3', config.bg)}>
        <StatusIcon className={cn('h-5 w-5 shrink-0 mt-0.5', config.color)} />
        <div>
          <p className={cn('text-[13px] font-bold', config.color)}>{config.label}</p>
          <p className="text-[12px] text-gray-600 mt-0.5 leading-relaxed">{config.description}</p>
        </div>
      </div>

      {/* Rejection / Failure Reason Banner */}
      {task.request?.failureReason && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-bold text-red-700">Failure / Rejection Reason</p>
            <p className="text-[12px] text-red-600 mt-0.5 leading-relaxed font-semibold">{task.request.failureReason}</p>
          </div>
        </div>
      )}

      {/* Main Grid: Info Responses (Left) vs Actions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left Column (Details Context) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Customer Biodata Section */}
          {task.customer && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <p className="text-[14px] font-bold text-gray-900">Customer Biodata</p>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="First Name" value={task.customer.firstName || 'N/A'} />
                <InfoRow label="Last Name" value={task.customer.lastName || 'N/A'} />
                <InfoRow label="Date of Birth" value={task.customer.dateOfBirth ? new Date(task.customer.dateOfBirth).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'} />
                <InfoRow label="Phone Number" value={task.customer.phoneNumber || 'N/A'} />
                <InfoRow label="Email" value={task.customer.email || 'N/A'} />
                <InfoRow label="Residential Address" value={task.customer.address || 'N/A'} />
                {task.verification?.bvnMasked && (
                  <InfoRow label="BVN" value={task.verification.bvnMasked} />
                )}
                {task.verification?.ninMasked && (
                  <InfoRow label="NIN" value={task.verification.ninMasked} />
                )}
              </div>
            </div>
          )}

          {/* Verification Status Details Section */}
          {task.verification && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <p className="text-[14px] font-bold text-gray-900">Identity Verification Summary</p>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Verification Type" value={task.verification.verificationType || 'N/A'} />
                <InfoRow label="Status" value={
                  <Badge variant="outline" className={cn(
                    'border text-[11px] font-semibold',
                    task.verification.status === 'VERIFIED' ? 'bg-green-50 text-green-600 border-green-200' :
                    task.verification.status === 'FAILED' ? 'bg-red-50 text-red-600 border-red-200' :
                    'bg-amber-50 text-amber-600 border-amber-200'
                  )}>
                    {task.verification.status || 'N/A'}
                  </Badge>
                } />
                <InfoRow label="Face Match Score" value={task.verification.matchScore != null ? `${task.verification.matchScore}%` : <span className="text-gray-400 italic font-normal">Not provided</span>} />
                <InfoRow label="Liveness Check" value={task.verification.livenessCheckPassed != null ? (task.verification.livenessCheckPassed ? 'PASSED' : 'FAILED') : <span className="text-gray-400 italic font-normal">Not provided</span>} />
                <InfoRow label="Liveness Score" value={task.verification.livenessScore != null ? `${task.verification.livenessScore}%` : <span className="text-gray-400 italic font-normal">Not provided</span>} />
              </div>
            </div>
          )}

          {/* Uploaded Documents List */}
          {task.documents && task.documents.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <p className="text-[14px] font-bold text-gray-900">Uploaded Documents</p>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {task.documents.map((doc: any) => (
                  <div key={doc.id} className="border border-gray-100 rounded-xl p-3 flex flex-col justify-between bg-gray-50/50">
                    <div className="flex items-start gap-2.5">
                      <FileText className="h-5 w-5 text-[#920793] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-gray-900 truncate">{doc.fileName || 'Document'}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">{doc.documentType}</p>
                      </div>
                    </div>
                    {doc.fileUrl && (
                      <div className="mt-3">
                        {/* If image, display mini preview */}
                        {doc.fileName?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                          <div className="relative h-28 border border-gray-200 rounded-lg overflow-hidden mb-2 bg-white">
                            <img src={doc.fileUrl} alt={doc.documentType} className="w-full h-full object-contain" />
                          </div>
                        ) : null}
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-bold text-[#920793] hover:underline"
                        >
                          View Full Document
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generic Task Details Metadata */}
          {false && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <p className="text-[14px] font-bold text-gray-900">Task Metadata</p>
              </div>
              <div className="px-5 py-1">
                <InfoRow label="Task ID" value={<span className="font-mono text-[12px]">{task?.id}</span>} />
                {task?.taskType && (
                  <InfoRow label="Task Type" value={task?.taskType} />
                )}
                {task?.assignedTo && (
                  <InfoRow label="Assigned To" value={task?.assignedTo?.staffName} />
                )}
                {task?.assignedBy && (
                  <InfoRow label="Assigned By" value={task?.assignedBy?.staffName} />
                )}
                {task?.createdAt && (
                  <InfoRow label="Created" value={task?.createdAt ? new Date(task?.createdAt as string).toLocaleString('en-NG') : 'N/A'} />
                )}
                <InfoRow label="Last Updated" value={task?.updatedAt ? new Date(task?.updatedAt as string).toLocaleString('en-NG') : 'N/A'} />
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Tailored Actions) */}
        <div className="space-y-4">
          
          {/* Action Header Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-[14px] font-bold text-gray-900">Required Action</p>
            
            {/* Task Action 1: Upload missing photo or form */}
            {(isPictureUploadTask || isReferenceUploadTask) && (
              <div className="space-y-4">
                <p className="text-[12px] text-gray-600">
                  {isPictureUploadTask 
                    ? 'Please upload a clear capture or passport photo of the customer.' 
                    : 'Please upload the completed Reference form.'}
                </p>
                <div className="relative border-2 border-dashed border-[#920793]/30 rounded-xl p-6 hover:bg-purple-50/20 transition-colors text-center cursor-pointer">
                  <input
                    type="file"
                    accept={isPictureUploadTask ? "image/*" : ".pdf,.png,.jpg,.jpeg"}
                    onChange={handleFileUpload}
                    disabled={uploadingFile}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-8 w-8 text-[#920793]/60 mx-auto mb-2" />
                  <span className="text-[12px] font-semibold text-gray-700 block">
                    {uploadingFile ? `Uploading (${uploadProgress}%)...` : 'Click to select or drop file'}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    {isPictureUploadTask ? 'PNG, JPG or WEBP up to 5MB' : 'PDF, PNG, or JPG up to 10MB'}
                  </span>
                </div>
              </div>
            )}

            {/* Task Action 2: Correction Form */}
            {isCorrectionTask && (
              <form onSubmit={handleCorrectionSubmit} className="space-y-3">
                <p className="text-[12px] text-gray-600">Review the details and apply corrections to retry verification.</p>
                
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">First Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full mt-1 px-3 h-9 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">Last Name</label>
                    <input
                      type="text"
                      required
                      value={editForm.lastName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full mt-1 px-3 h-9 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={editForm.dateOfBirth}
                      onChange={(e) => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full mt-1 px-3 h-9 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full mt-1 px-3 h-9 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full mt-1 px-3 h-9 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase">Residential Address</label>
                    <textarea
                      required
                      value={editForm.address}
                      rows={2}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793] resize-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSavingCorrection || isRetryingOpening}
                  className="w-full h-10 mt-2 bg-[#920793] hover:bg-[#720573] text-[13px] font-bold text-white"
                >
                  {isSavingCorrection || isRetryingOpening ? 'Processing...' : 'Submit Correction & Retry'}
                </Button>
              </form>
            )}

            {/* Task Action 3: Onboarding SMS/Email Dispatch */}
            {isOnboardingTask && (
              <div className="space-y-4">
                <p className="text-[12px] text-gray-600">The customer has been verified, but mobile banking registration failed or is pending. Click below to trigger the credentials dispatch.</p>
                <Button
                  onClick={handleTriggerOnboarding}
                  className="w-full h-10 bg-[#920793] hover:bg-[#720573] text-[13px] font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="h-4 w-4" /> Trigger Onboarding SMS (PIN)
                </Button>
              </div>
            )}

            {/* Task Action 4: Address / Location Review Panel */}
            {isManualLocationReview && (
              <div className="space-y-4">
                <p className="text-[12px] text-gray-600">Review the address match metrics and proof of address document (left) to approve or reject verification.</p>
                
                {isVerLoading ? (
                  <p className="text-center text-[13px] text-gray-500">Loading location metrics...</p>
                ) : !locationVerification ? (
                  <p className="text-center text-[13px] text-red-500">No verification record found.</p>
                ) : (
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-semibold text-gray-400 uppercase">Review Note</label>
                      <textarea
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Add reason for approval or rejection..."
                        rows={3}
                        className="w-full px-3 py-1.5 rounded-lg text-[13px] border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#920793] resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleLocationReject}
                        disabled={isReviewing}
                        className="h-9 rounded-lg text-white text-[12px] font-semibold bg-red-500 hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject (PIN)
                      </button>
                      <button
                        onClick={handleLocationApprove}
                        disabled={isReviewing}
                        className="h-9 rounded-lg text-white text-[12px] font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Approve (PIN)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Default fallback buttons */}
            {!isPictureUploadTask && !isReferenceUploadTask && !isCorrectionTask && !isOnboardingTask && !isManualLocationReview && (
              <div className="pt-2">
                <TaskActions
                  task={task}
                  onComplete={() => completeTask(task.id)}
                  onCancel={() => cancelTask(task.id)}
                />
              </div>
            )}

          </div>

          {/* Account Opening Form Link (if continueRoute is available) */}
          {continueRoute && !isCorrectionTask && !isPictureUploadTask && !isReferenceUploadTask && (
            <button
              onClick={() => router.push(continueRoute)}
              className="w-full h-11 rounded-xl text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#920793' }}
            >
              {continueLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

        </div>

      </div>
    </div>
  );
}