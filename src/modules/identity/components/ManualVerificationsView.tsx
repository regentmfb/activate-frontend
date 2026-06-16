'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useManualIdentitySessions, useApproveManual, useRejectManual } from '../hooks/useIdentityVerification';
import { usePinVerification } from '@src/modules/pin/hooks/usePinVerification';
import { useLocationVerifications, useSubmitLocationManualReview } from '@src/modules/account-opening/hooks/useLocationVerification';
import { documentsApi } from '@src/modules/documents/api/documents.api';
import { DataView, ColumnDef } from '@src/components/ui/DataView';
import { Shield, ShieldAlert, CheckCircle, XCircle, Clock, FileText, User, HelpCircle, X } from 'lucide-react';
import { format } from 'date-fns';

type UnifiedManualVerification = {
  id: string;
  isLocation: boolean;
  type: string;
  identifier: string;
  initiatedBy: {
    staffName: string;
    role: string;
  };
  reason: string;
  createdAt: string;
  raw?: any;
};

export function ManualVerificationsView() {
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedSession, setSelectedSession] = useState<UnifiedManualVerification | null>(null);
  const [rejectingSession, setRejectingSession] = useState<{ id: string; isLocation: boolean } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: identitySessions = [], isLoading: isIdLoading, error: idError, refetch: refetchId } = useManualIdentitySessions({
    page: 1,
    limit: 50,
    status,
  });

  const { data: locationData, isLoading: isLocLoading, error: locError, refetch: refetchLoc } = useLocationVerifications({
    page: 1,
    limit: 50,
    status,
  });

  const { data: documents = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ['manual-verification-docs', selectedSession?.id],
    queryFn: () => {
      if (!selectedSession) return [];
      if (selectedSession.isLocation) {
        return documentsApi.getDocuments({ activateRequestId: selectedSession.raw?.activateRequestId });
      } else {
        return documentsApi.getDocuments({ identityVerificationId: selectedSession.id });
      }
    },
    enabled: !!selectedSession,
  });

  const { requirePin } = usePinVerification();
  const approveMutation = useApproveManual();
  const rejectMutation = useRejectManual();
  const { mutate: submitLocationReview, isPending: isReviewing } = useSubmitLocationManualReview();

  const isLoading = isIdLoading || isLocLoading;
  const error = idError || locError;

  function refetchAll() {
    refetchId();
    refetchLoc();
  }

  function handleApprove(id: string, isLocation: boolean) {
    requirePin('APPROVE_WORKFLOW', () => {
      if (isLocation) {
        submitLocationReview(
          { id, payload: { status: 'APPROVED', reason: 'Approved via Manual Verifications' } },
          {
            onSuccess: () => {
              refetchLoc();
            },
          }
        );
      } else {
        approveMutation.mutate(id, {
          onSuccess: () => {
            refetchId();
          },
        });
      }
    });
  }

  function handleRejectSubmit() {
    if (!rejectingSession || !rejectionReason.trim()) return;
    
    requirePin('REJECT_WORKFLOW', () => {
      if (rejectingSession.isLocation) {
        submitLocationReview(
          { id: rejectingSession.id, payload: { status: 'REJECTED', reason: rejectionReason } },
          {
            onSuccess: () => {
              setRejectingSession(null);
              setRejectionReason('');
              refetchLoc();
            },
          }
        );
      } else {
        rejectMutation.mutate(
          { id: rejectingSession.id, payload: { reason: rejectionReason } },
          {
            onSuccess: () => {
              setRejectingSession(null);
              setRejectionReason('');
              refetchId();
            },
          }
        );
      }
    });
  }

  const unifiedSessions: UnifiedManualVerification[] = [
    ...identitySessions.map((s) => ({
      id: s.id,
      isLocation: false,
      type: s.verificationType,
      identifier: s.identifierMasked || 'N/A',
      initiatedBy: {
        staffName: s.initiatedBy?.staffName || 'Unknown Staff',
        role: s.initiatedBy?.role || 'RM',
      },
      reason: s.manualModeReason || 'No reason provided',
      createdAt: s.createdAt,
      raw: s,
    })),
    ...(locationData?.items || []).map((l) => ({
      id: l.id,
      isLocation: true,
      type: 'Location Address',
      identifier: l.address || 'N/A',
      initiatedBy: {
        staffName: (l.verifiedBy as any)?.staffName || 'RM / Field Agent',
        role: (l.verifiedBy as any)?.role || 'RM',
      },
      reason: l.isNearby === false ? 'Remote Verification (Bypassed proximity check)' : 'Proximity Check Failed',
      createdAt: (l.createdAt as string) || new Date().toISOString(),
      raw: l,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const columns: ColumnDef<UnifiedManualVerification>[] = [
    {
      key: 'type',
      header: 'Verification Type',
      render: (s) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#920793]">
          {s.type}
        </span>
      ),
    },
    {
      key: 'identifier',
      header: 'Identifier / Address',
      render: (s) => (
        <span className="font-mono font-medium text-gray-700 text-[13px] block max-w-[240px] truncate" title={s.identifier}>
          {s.identifier}
        </span>
      ),
    },
    {
      key: 'initiatedBy',
      header: 'Initiated By',
      render: (s) => (
        <div>
          <p className="font-semibold text-gray-900 text-[13px]">{s.initiatedBy.staffName}</p>
          <p className="text-[10px] text-gray-400">{s.initiatedBy.role}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Details / Reason',
      render: (s) => (
        <p className="text-[12px] text-gray-600 max-w-[200px] truncate" title={s.reason}>
          {s.reason}
        </p>
      ),
    },
    {
      key: 'date',
      header: 'Date Created',
      render: (s) => (
        <span className="text-[12px] text-gray-500">
          {format(new Date(s.createdAt), 'MMM dd, yyyy HH:mm')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (s) => {
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSession(s)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              Review
            </button>
            {status === 'pending' && (
              <>
                <button
                  onClick={() => handleApprove(s.id, s.isLocation)}
                  disabled={approveMutation.isPending || isReviewing}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectingSession({ id: s.id, isLocation: s.isLocation })}
                  disabled={rejectMutation.isPending || isReviewing}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            {status !== 'pending' && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded ${
                status === 'approved' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
              }`}>
                {status === 'approved' ? 'Approved' : 'Rejected'}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  function renderCard(s: UnifiedManualVerification) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4 text-left">
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#920793]">
            {s.type}
          </span>
          <span className="text-[11px] text-gray-400">
            {format(new Date(s.createdAt), 'MMM dd, HH:mm')}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-400">Identifier / Address:</span>
            <span className="font-semibold text-gray-900 truncate max-w-[200px]" title={s.identifier}>{s.identifier}</span>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span className="text-gray-400">Initiator:</span>
            <span className="font-semibold text-gray-900">{s.initiatedBy.staffName}</span>
          </div>

          <div className="border-t border-gray-50 pt-2 space-y-1">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Verification Reason</p>
            <p className="text-[12px] text-gray-600 bg-gray-50 p-2 rounded-lg leading-relaxed">
              {s.reason}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
          <button
            onClick={() => setSelectedSession(s)}
            className="flex-1 py-2 rounded-xl text-[12px] font-bold text-[#920793] bg-purple-50 hover:bg-purple-100 transition-colors text-center"
          >
            Review
          </button>
          {status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(s.id, s.isLocation)}
                disabled={approveMutation.isPending || isReviewing}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors text-center"
              >
                Approve
              </button>
              <button
                onClick={() => setRejectingSession({ id: s.id, isLocation: s.isLocation })}
                disabled={rejectMutation.isPending || isReviewing}
                className="flex-1 py-2 rounded-xl text-[12px] font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors text-center"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-black text-gray-900">Manual Verification Reviews</h1>
        <p className="text-[14px] text-gray-500 mt-0.5">Approve or reject manual KYC verification and remote location check overrides</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
        {(['pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatus(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              status === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-[13px] font-semibold text-red-600">Failed to load manual verifications</p>
          <button
            onClick={refetchAll}
            className="mt-2 text-[12px] font-bold text-[#920793] hover:underline"
          >
            Retry Loading
          </button>
        </div>
      ) : (
        <DataView
          data={unifiedSessions}
          columns={columns}
          renderCard={renderCard}
          keyExtractor={(s) => s.id}
          title={`${unifiedSessions.length} ${unifiedSessions.length === 1 ? 'Verification' : 'Verifications'}`}
          emptyMessage={`No ${status} manual verification sessions found.`}
          isLoading={isLoading}
          gridCols="grid-cols-1 md:grid-cols-2"
        />
      )}

      {/* Details & Review Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-purple-50/80 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-[#920793]" />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-gray-900">Review Verification Details</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">{selectedSession.type} check requested by {selectedSession.initiatedBy.staffName}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Identifier / Address</p>
                  <p className="text-[13px] font-bold text-gray-900 mt-0.5 break-all">{selectedSession.identifier}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Initiated By</p>
                  <p className="text-[13px] font-bold text-gray-900 mt-0.5">{selectedSession.initiatedBy.staffName} ({selectedSession.initiatedBy.role})</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Reason / Details</p>
                  <p className="text-[13px] font-bold text-gray-900 mt-0.5">{selectedSession.reason}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Date Switched</p>
                  <p className="text-[13px] font-bold text-gray-900 mt-0.5">
                    {format(new Date(selectedSession.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Review Section */}
            <div className="space-y-3 border-t border-gray-100 pt-4 mb-6">
              <h4 className="text-[13px] font-bold text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-[#920793]" /> Uploaded Documents ({documents.length})
              </h4>
              
              {isDocsLoading ? (
                <div className="p-8 text-center text-[12px] text-gray-400">Loading uploaded document attachments...</div>
              ) : documents.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-[12px] text-gray-400">
                  No document files found for this verification session.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-100 rounded-2xl p-3 bg-gray-50/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[12px] font-bold text-gray-800 truncate max-w-[160px]" title={doc.fileName}>{doc.fileName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">{doc.documentType?.replace(/_/g, ' ')}</p>
                        </div>
                        <span className="text-[10px] text-gray-400">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      </div>

                      {doc.mimeType?.startsWith('image/') || doc.fileName?.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                        <div className="relative aspect-video rounded-xl border border-gray-200 bg-black overflow-hidden flex items-center justify-center">
                          <img src={doc.url} alt={doc.fileName} className="max-h-full max-w-full object-contain" />
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-1.5 right-1.5 px-2 py-0.5 bg-black/75 hover:bg-black text-white text-[9px] font-bold rounded transition-colors"
                          >
                            Full Size
                          </a>
                        </div>
                      ) : (
                        <div className="aspect-video rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-1.5">
                          <FileText className="h-8 w-8 text-gray-400" />
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold text-[#920793] hover:underline"
                          >
                            Download Document
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions block inside the Modal */}
            {status === 'pending' ? (
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                <button
                  onClick={() => {
                    setRejectingSession({ id: selectedSession.id, isLocation: selectedSession.isLocation });
                    setSelectedSession(null);
                  }}
                  disabled={approveMutation.isPending || isReviewing}
                  className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors text-center"
                >
                  Reject Override
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedSession.id, selectedSession.isLocation);
                    setSelectedSession(null);
                  }}
                  disabled={approveMutation.isPending || isReviewing}
                  className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-white bg-[#920793] hover:bg-[#7a067b] disabled:opacity-50 transition-colors text-center shadow-lg shadow-purple-100"
                >
                  Approve Override (PIN)
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100 pt-4 text-center">
                <span className={`inline-flex items-center gap-1.5 text-[13px] font-bold px-4 py-2 rounded-2xl ${
                  status === 'approved' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                }`}>
                  {status === 'approved' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  Verification Already {status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rejection reason modal */}
      {rejectingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setRejectingSession(null)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-[16px] font-black text-gray-900">Reject Verification</h3>
                <p className="text-[12px] text-gray-400 mt-0.5">Please provide a reason for rejecting this override</p>
              </div>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason details..."
              rows={4}
              className="w-full p-3.5 rounded-2xl border border-gray-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none leading-relaxed"
            />

            <div className="flex items-center gap-2 mt-5">
              <button
                onClick={() => setRejectingSession(null)}
                className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-gray-500 hover:bg-gray-50 transition-colors border border-gray-100 text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim() || rejectMutation.isPending || isReviewing}
                className="flex-1 py-3 rounded-2xl text-[13px] font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors text-center shadow-lg shadow-red-100"
              >
                {rejectMutation.isPending || isReviewing ? 'Rejecting...' : 'Reject Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
